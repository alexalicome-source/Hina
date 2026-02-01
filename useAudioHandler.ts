
import { useState, useRef, useCallback } from 'react';
import { Blob } from '@google/genai';

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const useAudioHandler = () => {
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const inputAudioCtx = useRef<AudioContext | null>(null);
  const outputAudioCtx = useRef<AudioContext | null>(null);
  const nextStartTime = useRef<number>(0);
  const activeSources = useRef<Set<AudioBufferSourceNode>>(new Set());

  const resumeAudio = useCallback(async () => {
    try {
      if (inputAudioCtx.current?.state === 'suspended') await inputAudioCtx.current.resume();
      if (outputAudioCtx.current?.state === 'suspended') await outputAudioCtx.current.resume();
    } catch (e) { 
      console.warn("Audio Context failed to resume spontaneously. This is normal until interaction occurs."); 
    }
  }, []);

  const initAudio = useCallback(async (stream: MediaStream, onInput: (blob: Blob) => void, onLevel?: (level: number) => void) => {
    if (inputAudioCtx.current) {
      await resumeAudio();
      return;
    }

    // Input must be 16kHz for Gemini
    inputAudioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    // Output should be 24kHz for Gemini
    outputAudioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    const source = inputAudioCtx.current.createMediaStreamSource(stream);
    const processor = inputAudioCtx.current.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Compute mic level for visual feedback
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) { sum += inputData[i] * inputData[i]; }
      if (onLevel) onLevel(Math.sqrt(sum / inputData.length));

      const l = inputData.length;
      const int16 = new Int16Array(l);
      for (let i = 0; i < l; i++) {
        const val = Math.max(-1, Math.min(1, inputData[i]));
        int16[i] = val * 32768;
      }
      onInput({
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
      });
    };

    source.connect(processor);
    processor.connect(inputAudioCtx.current.destination);
    setIsAudioInitialized(true);
  }, [resumeAudio]);

  const processOutputAudio = useCallback(async (base64Audio: string) => {
    if (!outputAudioCtx.current) return;
    const ctx = outputAudioCtx.current;
    
    // Crucial: Context must be resumed before playing
    if (ctx.state === 'suspended') await ctx.resume();

    const bytes = decode(base64Audio);
    const dataInt16 = new Int16Array(bytes.buffer);
    const numChannels = 1;
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, 24000);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    const now = ctx.currentTime;
    if (nextStartTime.current < now) nextStartTime.current = now;
    
    source.start(nextStartTime.current);
    nextStartTime.current += buffer.duration;
    
    activeSources.current.add(source);
    source.onended = () => activeSources.current.delete(source);
  }, []);

  const stopOutputAudio = useCallback(() => {
    activeSources.current.forEach(s => { try { s.stop(); } catch(e) {} });
    activeSources.current.clear();
    nextStartTime.current = 0;
  }, []);

  return { initAudio, processOutputAudio, stopOutputAudio, isAudioInitialized, resumeAudio };
};
