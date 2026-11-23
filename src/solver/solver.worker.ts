import { solve, isDeadEnd } from './solver';
import { GameState } from '../engine/types';

export interface WorkerSolveRequest {
  id: string;
  type: 'solve' | 'deadEnd';
  state: GameState;
  budget?: number;
}

export interface WorkerSolveResponse {
  id: string;
  type: 'solveResult' | 'deadEndResult';
  solvable?: boolean;
  moves?: any[];
  isDeadEnd?: boolean;
}

self.onmessage = (e: MessageEvent<WorkerSolveRequest>) => {
  const req = e.data;
  if (!req) return;

  if (req.type === 'solve') {
    const res = solve(req.state, { maxNodes: req.budget || 20000 });
    const response: WorkerSolveResponse = {
      id: req.id,
      type: 'solveResult',
      solvable: res.solvable,
      moves: res.solution,
    };
    self.postMessage(response);
  } else if (req.type === 'deadEnd') {
    const dead = isDeadEnd(req.state, req.budget || 3000);
    const response: WorkerSolveResponse = {
      id: req.id,
      type: 'deadEndResult',
      isDeadEnd: dead,
    };
    self.postMessage(response);
  }
};
