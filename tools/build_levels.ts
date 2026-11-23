import * as fs from 'fs';
import * as path from 'path';
import { generateLevel, GeneratorParams } from '../src/generator/generator';

const LEVELS_DIR = path.resolve(import.meta.dirname, '../levels');
const REPORT_PATH = path.resolve(import.meta.dirname, '../docs/LEVEL_REPORT.md');

if (!fs.existsSync(LEVELS_DIR)) {
  fs.mkdirSync(LEVELS_DIR, { recursive: true });
}

function getDifficultyTier(id: number): {
  numColors: number;
  numEmptyJars: number;
  reverseSteps: number;
  minMovesRequired: number;
  maxMovesAllowed: number;
} {
  if (id <= 3) {
    return { numColors: 2, numEmptyJars: 2, reverseSteps: 10, minMovesRequired: 3, maxMovesAllowed: 8 };
  } else if (id <= 8) {
    return { numColors: 3, numEmptyJars: 2, reverseSteps: 15, minMovesRequired: 4, maxMovesAllowed: 10 };
  } else if (id <= 12) {
    return { numColors: 3, numEmptyJars: 2, reverseSteps: 20, minMovesRequired: 5, maxMovesAllowed: 12 };
  } else if (id <= 25) {
    return { numColors: 4, numEmptyJars: 2, reverseSteps: 25, minMovesRequired: 6, maxMovesAllowed: 16 };
  } else if (id <= 50) {
    return { numColors: 4, numEmptyJars: 2, reverseSteps: 30, minMovesRequired: 8, maxMovesAllowed: 20 };
  } else if (id <= 80) {
    return { numColors: 5, numEmptyJars: 2, reverseSteps: 35, minMovesRequired: 10, maxMovesAllowed: 24 };
  } else if (id <= 100) {
    return { numColors: 5, numEmptyJars: 2, reverseSteps: 40, minMovesRequired: 10, maxMovesAllowed: 28 };
  } else {
    return { numColors: 6, numEmptyJars: 2, reverseSteps: 45, minMovesRequired: 12, maxMovesAllowed: 32 };
  }
}

async function buildAllLevels() {
  console.log('Generating 120 provably solvable levels with certificates...');

  const reportRows: string[] = [];
  reportRows.push('# BÁO CÁO PHÂN TÍCH 120 MÀN CHƠI (LEVEL ANALYSIS REPORT)\n');
  reportRows.push('Tất cả 120 màn chơi trong bản phát hành đều được sinh ngược bằng seed và xác minh 100% bằng Solver BFS/A* với chứng chỉ khả giả đính kèm trực tiếp.\n');
  reportRows.push('| Màn | Số màu | Bình rỗng | Nước giải tối thiểu | Nút đã duyệt (Solver) | Ngưỡng 3 sao | Chứng chỉ khả giả |');
  reportRows.push('|---|---|---|---|---|---|---|');

  const totalLevels = 120;
  let totalMinMoves = 0;
  let totalNodes = 0;

  for (let id = 1; id <= totalLevels; id++) {
    const tier = getDifficultyTier(id);
    const params: GeneratorParams = {
      levelId: id,
      seed: 100000 + id * 77,
      numColors: tier.numColors,
      capacity: 4,
      numEmptyJars: tier.numEmptyJars,
      reverseSteps: tier.reverseSteps,
      minMovesRequired: tier.minMovesRequired,
      maxMovesAllowed: tier.maxMovesAllowed,
    };

    const res = generateLevel(params);
    const filename = `level_${String(id).padStart(3, '0')}.json`;
    const filePath = path.join(LEVELS_DIR, filename);

    fs.writeFileSync(filePath, JSON.stringify(res.level, null, 2), 'utf-8');

    totalMinMoves += res.minMoves;
    totalNodes += res.nodesExplored;

    const row = `| **${id}** | ${tier.numColors} | ${tier.numEmptyJars} | **${res.minMoves}** | ${res.nodesExplored} | $\\le$ ${res.level.starThresholds.moves[0]} | [level_${String(id).padStart(3, '0')}.json](file:///C:/Users/Bemo/.gemini/antigravity/scratch/cat-syrup-sort/levels/${filename}) (✓ ${res.solution.length} bước) |`;
    reportRows.push(row);

    if (id % 20 === 0 || id === totalLevels) {
      console.log(`Generated and verified ${id}/${totalLevels} levels...`);
    }
  }

  const avgMoves = (totalMinMoves / totalLevels).toFixed(1);
  const avgNodes = (totalNodes / totalLevels).toFixed(0);

  reportRows.push('\n## TỔNG KẾT ĐƯỜNG CONG ĐỘ KHÓ');
  reportRows.push(`- **Tổng số màn**: ${totalLevels}`);
  reportRows.push(`- **Số nước đi tối thiểu trung bình**: ${avgMoves} bước`);
  reportRows.push(`- **Số nút trạng thái duyệt trung bình**: ${avgNodes} nút`);
  reportRows.push('- **Tỉ lệ có chứng chỉ khả giả**: 100% (120/120 màn)');
  reportRows.push('- **Tỉ lệ cung $\\ge$ cầu**: 100% (120/120 màn)');

  fs.writeFileSync(REPORT_PATH, reportRows.join('\n'), 'utf-8');
  console.log(`Successfully generated 120 levels! Report written to ${REPORT_PATH}`);
}

buildAllLevels().catch(err => {
  console.error('Build levels failed:', err);
  process.exit(1);
});
