/**
 * 1091. Shortest Path in Binary Matrix
 *
 * Given an n x n binary matrix grid, return the length of the shortest
 * clear path from top-left (0,0) to bottom-right (n-1, n-1).
 * Move in 8 directions. Path length = number of cells visited.
 * Return -1 if no path exists.
 */

export function shortestPathBinaryMatrix(grid: number[][]): number {
  // Your solution herei;
  const queue = [{ loc: [0, 0], pathLength: 1 }];
  const visited = new Set();
  const DIRECTIONS = [[0, 1], [1, 0], [-1, 0], [0, -1], [-1, -1], [1, 1], [1, -1], [-1, 1]]

  while (queue.length > 0) {
    const { loc, pathLength } = queue.shift();
    const [row, col] = loc;
    for (const dir of DIRECTIONS) {
      const nr = row + dir[0];
      const nc = col + dir[1];

      if (nr < 0 || nc < 0 || nr > grid.length - 1 || nc > grid.length - 1 || !visited.has(`${nr},${nc}`) || grid[nr][nc] !== 0) {
        continue;
      }
      queue.push({ loc: [nr, nc], pathLength: pathLength + 1 })
    }
    visited.add(`${row},${col}`)

    if (row === grid.length - 1 && col === grid.length - 1) {
      return pathLength;
    }

  }
  return -1;
}
