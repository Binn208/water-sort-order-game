import { describe, expect, it } from 'vitest';
import { addRescueJar, applyMove, canonicalHash, canPour, computePourAmount, createGame, deserializeState, exactHash, getTopColorRun, legalMoves, serializeState, undo, } from '../../src/engine';
describe('Engine Rules (Đặc tả luật chơi)', () => {
    const sampleLevel = {
        id: 1,
        jars: [
            { id: 'j1', capacity: 4, layers: ['strawberry', 'strawberry', 'blueberry', 'blueberry'] },
            { id: 'j2', capacity: 4, layers: ['blueberry', 'blueberry', 'strawberry', 'strawberry'] },
            { id: 'j3', capacity: 4, layers: [] },
        ],
        orders: [
            { id: 'o1', customerId: 'cat_orange', color: 'strawberry', count: 1, maxPatienceSeconds: 60 },
            { id: 'o2', customerId: 'cat_siamese', color: 'blueberry', count: 1, maxPatienceSeconds: 60 },
        ],
        starThresholds: { moves: [10, 15, 20] },
    };
    it('4.1 Khởi tạo game và bảo toàn bất biến ban đầu', () => {
        const game = createGame(sampleLevel);
        expect(game.jars.length).toBe(3);
        expect(game.orders.length).toBe(2);
        expect(game.initialSupplies['strawberry']).toBe(4);
        expect(game.initialSupplies['blueberry']).toBe(4);
        expect(game.isWon).toBe(false);
        expect(game.isStuck).toBe(false);
        expect(game.freeRescueAvailable).toBe(true);
    });
    it('4.1 Bắt lỗi khi tổng cung < nhu cầu đơn hàng (Softlock prevention at data load)', () => {
        const invalidLevel = {
            id: 999,
            jars: [
                { id: 'j1', capacity: 4, layers: ['strawberry', 'strawberry', 'strawberry'] }, // only 3 units
                { id: 'j2', capacity: 4, layers: [] },
            ],
            orders: [
                { id: 'o1', customerId: 'cat_hungry', color: 'strawberry', count: 1, maxPatienceSeconds: 60 }, // requires 4 units
            ],
            starThresholds: { moves: [5, 10, 15] },
        };
        expect(() => createGame(invalidLevel)).toThrowError(/Supply deficit for color 'strawberry'/);
    });
    it('4.2 Lấy khối màu trên cùng (getTopColorRun)', () => {
        const jar = { id: 'j1', capacity: 4, layers: ['strawberry', 'blueberry', 'blueberry'] };
        const run = getTopColorRun(jar);
        expect(run).toEqual({ color: 'blueberry', count: 2 });
        const emptyJar = { id: 'j2', capacity: 4, layers: [] };
        expect(getTopColorRun(emptyJar)).toBeNull();
    });
    it('4.2 Kiểm tra tính hợp lệ của thao tác đổ (canPour)', () => {
        const src = { id: 'src', capacity: 4, layers: ['strawberry', 'blueberry'] };
        const validTgt = { id: 'tgt1', capacity: 4, layers: ['strawberry', 'blueberry'] };
        const mismatchTgt = { id: 'tgt2', capacity: 4, layers: ['kiwi'] };
        const fullTgt = { id: 'tgt3', capacity: 4, layers: ['blueberry', 'blueberry', 'blueberry', 'blueberry'] };
        const emptyTgt = { id: 'tgt4', capacity: 4, layers: [] };
        expect(canPour(src, validTgt)).toBe(true);
        expect(canPour(src, emptyTgt)).toBe(true);
        expect(canPour(src, mismatchTgt)).toBe(false);
        expect(canPour(src, fullTgt)).toBe(false);
        expect(canPour(src, src)).toBe(false); // Cannot pour into self
    });
    it('4.2 Đổ một phần khi đích chỉ còn ít chỗ hơn kích thước khối nguồn (Partial pour)', () => {
        const level = {
            id: 2,
            jars: [
                // src has 3 blueberries on top (1 lemon, 3 blueberries)
                { id: 'src', capacity: 4, layers: ['lemon', 'blueberry', 'blueberry', 'blueberry'] },
                // tgt has 3 layers, space for only 1 (2 lemons, 1 blueberry)
                { id: 'tgt', capacity: 4, layers: ['lemon', 'lemon', 'blueberry'] },
                // j3 balances remaining units (1 lemon, supply = 4 lemon, 4 blueberry)
                { id: 'j3', capacity: 4, layers: ['lemon'] },
            ],
            orders: [
                { id: 'o1', customerId: 'c1', color: 'lemon', count: 1, maxPatienceSeconds: 60 },
                { id: 'o2', customerId: 'c2', color: 'blueberry', count: 1, maxPatienceSeconds: 60 },
            ],
            starThresholds: { moves: [5, 10, 15] },
        };
        const game = createGame(level);
        const amount = computePourAmount(game.jars[0], game.jars[1]);
        expect(amount).toBe(1); // Only 1 can fit
        const nextGame = applyMove(game, {
            fromJarId: 'src',
            toJarId: 'tgt',
            count: 1,
            color: 'blueberry',
        });
        // 2 blueberries remained in source
        const updatedSrc = nextGame.jars.find(j => j.id === 'src');
        const updatedTgt = nextGame.jars.find(j => j.id === 'tgt');
        expect(updatedSrc.layers).toEqual(['lemon', 'blueberry', 'blueberry']);
        expect(updatedTgt.layers).toEqual(['lemon', 'lemon', 'blueberry', 'blueberry']);
    });
    it('4.3 Tự động đóng nắp, giao cho khách và giải phóng chỗ khi bình đầy cùng màu', () => {
        const level = {
            id: 3,
            jars: [
                { id: 'src', capacity: 4, layers: ['strawberry', 'strawberry'] },
                { id: 'tgt', capacity: 4, layers: ['strawberry', 'strawberry'] },
            ],
            orders: [
                { id: 'o1', customerId: 'cat_mochi', color: 'strawberry', count: 1, maxPatienceSeconds: 60 },
            ],
            starThresholds: { moves: [5, 10, 15] },
        };
        const game = createGame(level);
        expect(game.jars.length).toBe(2);
        const nextGame = applyMove(game, {
            fromJarId: 'src',
            toJarId: 'tgt',
            count: 2,
            color: 'strawberry',
        });
        // tgt was packed and delivered to cat_mochi, so it left the table
        expect(nextGame.jars.map(j => j.id)).toEqual(['src']);
        expect(nextGame.orders[0].fulfilledCount).toBe(1);
        expect(nextGame.isWon).toBe(true);
        expect(nextGame.deliveredColorsCount['strawberry']).toBe(1);
    });
    it('4.3 Giao cho người chờ lâu nhất trước khi có nhiều khách cùng đợi một màu', () => {
        const level = {
            id: 4,
            jars: [
                { id: 'j_src', capacity: 4, layers: ['strawberry'] },
                { id: 'j_tgt', capacity: 4, layers: ['strawberry', 'strawberry', 'strawberry'] },
                // Another 4 units split into two non-full jars to satisfy 8 total demand without auto-packing yet
                { id: 'j_reserve1', capacity: 4, layers: ['strawberry', 'strawberry'] },
                { id: 'j_reserve2', capacity: 4, layers: ['strawberry', 'strawberry'] },
            ],
            orders: [
                { id: 'order_early', customerId: 'cat_grandpa', color: 'strawberry', count: 1, maxPatienceSeconds: 90 },
                { id: 'order_late', customerId: 'cat_kitten', color: 'strawberry', count: 1, maxPatienceSeconds: 30 },
            ],
            starThresholds: { moves: [5, 10, 15] },
        };
        const game = createGame(level);
        // Note: order_early was added before order_late (createdAt 0 vs 1)
        const nextGame = applyMove(game, {
            fromJarId: 'j_src',
            toJarId: 'j_tgt',
            count: 1,
            color: 'strawberry',
        });
        const early = nextGame.orders.find(o => o.id === 'order_early');
        const late = nextGame.orders.find(o => o.id === 'order_late');
        expect(early.fulfilledCount).toBe(1);
        expect(late.fulfilledCount).toBe(0);
    });
    it('4.3 Xử lý màu dư không có đơn hàng (Byproduct): vẫn đóng gói dọn khỏi bàn', () => {
        const level = {
            id: 5,
            jars: [
                { id: 'j1', capacity: 4, layers: ['lemon', 'lemon'] },
                { id: 'j2', capacity: 4, layers: ['lemon', 'lemon'] },
                { id: 'j3', capacity: 4, layers: ['strawberry', 'strawberry', 'strawberry'] },
                { id: 'j4', capacity: 4, layers: ['strawberry'] },
            ],
            orders: [
                // Only strawberry is ordered (4 units), lemon (4 units) is extra byproduct
                { id: 'o1', customerId: 'c1', color: 'strawberry', count: 1, maxPatienceSeconds: 60 },
            ],
            starThresholds: { moves: [5, 10, 15] },
        };
        const game = createGame(level);
        const nextGame = applyMove(game, {
            fromJarId: 'j1',
            toJarId: 'j2',
            count: 2,
            color: 'lemon',
        });
        // j2 became full uniform lemon -> packaged as byproduct, left the table
        expect(nextGame.jars.some(j => j.id === 'j2')).toBe(false);
        expect(nextGame.history[0].packedEvents[0].byproduct).toBe(true);
        // order o1 is unaffected
        expect(nextGame.orders[0].fulfilledCount).toBe(0);
    });
    it('4.4 Phát hiện kẹt (Stuck) và cơ chế cứu hộ miễn phí (Free rescue)', () => {
        // A deadlock state with capacity 2, no empty jars and mismatching tops
        const stuckLevel = {
            id: 6,
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
        const game = createGame(stuckLevel);
        expect(legalMoves(game).length).toBe(0);
        expect(game.isStuck).toBe(true);
        expect(game.freeRescueAvailable).toBe(true);
        // Use free rescue jar
        const rescuedGame = addRescueJar(game);
        expect(rescuedGame.freeRescueAvailable).toBe(false);
        expect(rescuedGame.jars.length).toBe(3);
        expect(rescuedGame.isStuck).toBe(false);
        expect(legalMoves(rescuedGame).length).toBeGreaterThan(0);
    });
    it('4.6 Hoàn tác khôi phục trạng thái nguyên vẹn kể cả bình đã đóng gói (Undo)', () => {
        const level = {
            id: 7,
            jars: [
                { id: 'src', capacity: 4, layers: ['strawberry'] },
                { id: 'tgt', capacity: 4, layers: ['strawberry', 'strawberry', 'strawberry'] },
            ],
            orders: [
                { id: 'o1', customerId: 'cat1', color: 'strawberry', count: 1, maxPatienceSeconds: 60 },
            ],
            starThresholds: { moves: [5, 10, 15] },
        };
        const initial = createGame(level);
        const initialHash = canonicalHash(initial);
        const initialExactHash = exactHash(initial);
        // Apply move that fulfills order and packs jar
        const afterMove = applyMove(initial, {
            fromJarId: 'src',
            toJarId: 'tgt',
            count: 1,
            color: 'strawberry',
        });
        expect(afterMove.isWon).toBe(true);
        expect(afterMove.jars.length).toBe(1);
        // Undo
        const afterUndo = undo(afterMove);
        expect(afterUndo.isWon).toBe(false);
        expect(afterUndo.jars.length).toBe(2);
        expect(afterUndo.orders[0].fulfilledCount).toBe(0);
        expect(canonicalHash(afterUndo)).toBe(initialHash);
        expect(exactHash(afterUndo)).toBe(initialExactHash);
    });
    it('Serialization & Deserialization khôi phục chính xác 100%', () => {
        const game = createGame(sampleLevel);
        const serialized = serializeState(game);
        const restored = deserializeState(serialized);
        expect(canonicalHash(restored)).toBe(canonicalHash(game));
        expect(exactHash(restored)).toBe(exactHash(game));
    });
});
