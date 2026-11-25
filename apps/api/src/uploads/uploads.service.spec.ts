import { detectImageExtension } from './uploads.service.js';

describe('detectImageExtension', () => {
  it('recognizes PNG, JPEG and WebP by their signature', () => {
    expect(detectImageExtension(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe('png');
    expect(detectImageExtension(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('jpg');
    expect(detectImageExtension(Buffer.from('RIFF\0\0\0\0WEBPVP8 ', 'latin1'))).toBe('webp');
  });

  it('rejects anything else, such as SVG or HTML', () => {
    expect(detectImageExtension(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'))).toBeUndefined();
    expect(detectImageExtension(Buffer.alloc(0))).toBeUndefined();
  });
});
