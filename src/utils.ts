import { readdir } from 'fs/promises';
import { join } from 'node:path';
import { SVGFile } from './types';

/**
 * get folder svg files
 * @param path
 * @returns
 */
export async function readFolder(path: string): Promise<SVGFile[]> {
  try {
    const fileNames = await readdir(path);
    return fileNames
      .filter((fileName: string) => /.svg$/.test(fileName))
      .map((fileName: string) => ({
        name: fileName,
        path: join(path, fileName)
      }));
  } catch (error) {
    console.error('svgtvc: read folder error! ', error);
    return [];
  }
}
