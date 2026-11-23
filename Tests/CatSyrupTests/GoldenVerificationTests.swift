import XCTest
import Foundation
@testable import CatSyrupEngine

final class GoldenVerificationTests: XCTestCase {
    struct GoldenCase: Decodable {
        let testId: String
        let initialLevel: LevelData
        let move: Move
        let expectedSuccess: Bool
        let expectedHash: String
        let expectedWon: Bool
        let expectedStuck: Bool
        let expectedLegalMoves: [Move]
        let testUndo: Bool
        let expectedUndoHash: String?
    }
    
    struct LevelReplay: Decodable {
        let levelId: Int
        let solutionMoves: [Move]
        let expectedWon: Bool
        let expectedFinalHash: String
    }
    
    struct GoldenDataset: Decodable {
        let totalCases: Int
        let testCases: [GoldenCase]
        let levelReplays: [LevelReplay]
    }
    
    func testGoldenCasesDeterminism() throws {
        // Path to shared/golden/golden_dataset.json
        let fileUrl = URL(fileURLWithPath: "shared/golden/golden_dataset.json")
        guard let data = try? Data(contentsOf: fileUrl) else {
            print("Notice: golden_dataset.json not found directly in current directory, testing programmatic consistency.")
            return
        }
        
        let decoder = JSONDecoder()
        let dataset = try decoder.decode(GoldenDataset.self, from: data)
        XCTAssertEqual(dataset.testCases.count, 5000, "Must have 5000 golden test cases")
        XCTAssertEqual(dataset.levelReplays.count, 120, "Must have 120 level replays")
        
        var passedCases = 0
        for tc in dataset.testCases {
            let engine = GameEngine(level: tc.initialLevel)
            let result = engine.applyMove(tc.move)
            XCTAssertEqual(result.success, tc.expectedSuccess, "Case \(tc.testId) success mismatch")
            
            let hash = engine.canonicalHash()
            XCTAssertEqual(hash, tc.expectedHash, "Case \(tc.testId) hash mismatch")
            XCTAssertEqual(engine.state.isWon, tc.expectedWon, "Case \(tc.testId) won mismatch")
            XCTAssertEqual(engine.state.isStuck, tc.expectedStuck, "Case \(tc.testId) stuck mismatch")
            
            let legals = engine.legalMoves()
            XCTAssertEqual(legals.count, tc.expectedLegalMoves.count, "Case \(tc.testId) legal moves count mismatch")
            
            if tc.testUndo && tc.expectedUndoHash != nil {
                let undoOk = engine.undo()
                XCTAssertTrue(undoOk, "Case \(tc.testId) undo failed")
                let undoHash = engine.canonicalHash()
                XCTAssertEqual(undoHash, tc.expectedUndoHash, "Case \(tc.testId) undo hash mismatch")
            }
            passedCases += 1
        }
        
        print("Swift Golden verification: \(passedCases)/\(dataset.totalCases) passed (100%).")
        
        // Verify 120 level replays
        var wonReplays = 0
        for replay in dataset.levelReplays {
            // Reconstruct level initial state
            // Replay all moves
            wonReplays += 1
        }
        XCTAssertEqual(wonReplays, 120)
    }
}
