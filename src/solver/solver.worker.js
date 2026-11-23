import { solve, isDeadEnd } from './solver';
self.onmessage = (e) => {
    const req = e.data;
    if (!req)
        return;
    if (req.type === 'solve') {
        const res = solve(req.state, { maxNodes: req.budget || 20000 });
        const response = {
            id: req.id,
            type: 'solveResult',
            solvable: res.solvable,
            moves: res.solution,
        };
        self.postMessage(response);
    }
    else if (req.type === 'deadEnd') {
        const dead = isDeadEnd(req.state, req.budget || 3000);
        const response = {
            id: req.id,
            type: 'deadEndResult',
            isDeadEnd: dead,
        };
        self.postMessage(response);
    }
};
