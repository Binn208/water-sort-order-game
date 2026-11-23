import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, it } from 'vitest';
import { computeCurrentJarUnits, validateSupplyVsDemand } from '../../src/engine/invariants';
import { verifySolution } from '../../src/solver/solver';
describe('Kho 120 Màn Chơi (CI Repository Level Validator)', () => {
    const levelsDir = path.resolve(import.meta.dirname, '../../levels');
    it('Kho chứa đủ đúng 120 file màn chơi chuẩn', () => {
        for (let id = 1; id <= 120; id++) {
            const filename = `level_${String(id).padStart(3, '0')}.json`;
            const fullPath = path.join(levelsDir, filename);
            expect(fs.existsSync(fullPath), `Màn ${filename} phải tồn tại`).toBe(true);
        }
    });
    it('100% 120 màn chơi thỏa mãn Cung >= Cầu (Không có màn nào thiếu hụt)', () => {
        for (let id = 1; id <= 120; id++) {
            const filename = `level_${String(id).padStart(3, '0')}.json`;
            const fullPath = path.join(levelsDir, filename);
            const level = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
            const initialSupplies = computeCurrentJarUnits(level.jars);
            const capacity = level.jars[0]?.capacity || 4;
            const check = validateSupplyVsDemand(initialSupplies, level.orders, capacity);
            expect(check.valid, `Màn ${id} không được vi phạm Cung >= Cầu: ${check.errors.join('; ')}`).toBe(true);
        }
    });
    it('100% 120 màn chơi có chứng chỉ khả giả và phát lại đường giải đạt chiến thắng', () => {
        for (let id = 1; id <= 120; id++) {
            const filename = `level_${String(id).padStart(3, '0')}.json`;
            const fullPath = path.join(levelsDir, filename);
            const level = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
            expect(level.solution, `Màn ${id} phải có mảng chứng chỉ solution`).toBeDefined();
            expect(level.solution.length, `Màn ${id} phải có ít nhất 1 nước giải`).toBeGreaterThan(0);
            const replay = verifySolution(level, level.solution);
            expect(replay.win, `Màn ${id} phát lại giải pháp phải thắng, lỗi: ${replay.error}`).toBe(true);
        }
    });
});
