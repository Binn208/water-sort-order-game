import { describe, expect, it } from 'vitest';
import { LevelDefinition } from '../../src/engine/types';
import { isDeadEnd, solve, verifySolution } from '../../src/solver/solver';

describe('Solver BFS/A* & Solvability Certificates (Mục 5)', () => {
  const level: LevelDefinition = {
    id: 1,
    jars: [
      { id: 'j1', capacity: 4, layers: ['strawberry', 'strawberry', 'blueberry', 'blueberry'] },
      { id: 'j2', capacity: 4, layers: ['blueberry', 'blueberry', 'strawberry', 'strawberry'] },
      { id: 'j3', capacity: 4, layers: [] },
      { id: 'j4', capacity: 4, layers: [] },
    ],
    orders: [
      { id: 'o1', customerId: 'cat_1', color: 'strawberry', count: 1, maxPatienceSeconds: 60 },
      { id: 'o2', customerId: 'cat_2', color: 'blueberry', count: 1, maxPatienceSeconds: 60 },
    ],
    starThresholds: { moves: [10, 15, 20] },
  };

  it('Solver tìm được đường giải tối ưu cho màn chơi', () => {
    const res = solve(level);
    expect(res.solvable).toBe(true);
    expect(res.solution.length).toBeGreaterThan(0);
    expect(res.nodesExplored).toBeGreaterThan(0);
  });

  it('Phát lại đường giải (verifySolution) chứng minh màn chơi thắng 100%', () => {
    const res = solve(level);
    expect(res.solvable).toBe(true);

    const replay = verifySolution(level, res.solution);
    expect(replay.win).toBe(true);
    expect(replay.finalState.isWon).toBe(true);
  });

  it('Phát hiện thế cờ chết (Dead-end detection)', () => {
    const deadEndLevel: LevelDefinition = {
      id: 99,
      jars: [
        { id: 'j1', capacity: 2, layers: ['strawberry', 'blueberry'] },
        { id: 'j2', capacity: 2, layers: ['blueberry', 'strawberry'] },
      ],
      orders: [
        { id: 'o1', customerId: 'c1', color: 'strawberry', count: 1, maxPatienceSeconds: 60 },
        { id: 'o2', customerId: 'c2', color: 'blueberry', count: 1, maxPatienceSeconds: 60 },
      ],
      starThresholds: { moves: [5, 10, 15] },
    };

    const res = solve(deadEndLevel);
    expect(res.solvable).toBe(false);
  });
});
