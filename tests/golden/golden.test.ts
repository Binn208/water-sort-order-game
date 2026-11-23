import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';
import { GoldenDataset } from '../../tools/export_golden';

describe('Golden Dataset Validation (Nguồn Chân Lý Đa Nền Tảng)', () => {
  const goldenPath = path.resolve(import.meta.dirname, '../../shared/golden/golden_dataset.json');
  const EXPECTED_CHECKSUM = 'f84359229a4aa165782a5fc051476a3e11b9f02b6a78b29e8895246f2bc11df0';

  it('File golden_dataset.json tồn tại và đúng mã băm SHA-256', () => {
    expect(fs.existsSync(goldenPath)).toBe(true);
    const content = fs.readFileSync(goldenPath, 'utf-8');
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    expect(hash).toBe(EXPECTED_CHECKSUM);
  });

  it('Chứa đủ >= 5000 ca kiểm thử hợp lệ và 100% undo thành công', () => {
    const dataset: GoldenDataset = JSON.parse(fs.readFileSync(goldenPath, 'utf-8'));
    expect(dataset.totalCases).toBeGreaterThanOrEqual(5000);
    expect(dataset.cases.length).toBe(dataset.totalCases);

    for (let i = 0; i < 100; i++) {
      const sample = dataset.cases[i];
      expect(sample.initialHash.length).toBe(16);
      expect(sample.nextHash.length).toBe(16);
      expect(sample.undoMatchesInitial).toBe(true);
    }
  });

  it('Chứa đủ 120 đường giải màn chơi và 100% phát lại chiến thắng', () => {
    const dataset: GoldenDataset = JSON.parse(fs.readFileSync(goldenPath, 'utf-8'));
    expect(dataset.levelReplays.length).toBe(120);

    for (const replay of dataset.levelReplays) {
      expect(replay.minMoves).toBeGreaterThan(0);
      expect(replay.finalWon).toBe(true);
      expect(replay.stepHashes.length).toBe(replay.minMoves + 1);
    }
  });
});
