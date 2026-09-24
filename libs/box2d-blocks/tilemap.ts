namespace tiles {
    export interface TileMapData {
        getWallImage(): Image;
    }
}

namespace box2dblocks {
    export class _TilemapWallState {
        private wallImage: Image;
        private wallSnapshot: Image;
        private wallRevision = -1;
        private scale = -1;
        private width = -1;
        private height = -1;

        constructor(public body: Body) {}

        update(): void {
            if (!this.body || this.body.destroyed || !this.body.nativeBody.valid)
                return;

            const scene = game.currentScene();
            const tilemap = scene && scene.tileMap;
            const data = tilemap && tilemap.enabled ? tilemap.data : null;
            const wallImage = data ? data.getWallImage() : null;
            const revision = wallImage ? wallImage.revision() : -1;
            const scale = tilemap && tilemap.enabled ? tilemap.scale : -1;
            const width = data ? data.width : 0;
            const height = data ? data.height : 0;

            if (wallImage == this.wallImage &&
                revision == this.wallRevision &&
                scale == this.scale &&
                width == this.width &&
                height == this.height)
                return;

            if (wallImage && this.wallSnapshot &&
                scale == this.scale &&
                width == this.width &&
                height == this.height &&
                wallImage.equals(this.wallSnapshot)) {
                this.wallImage = wallImage;
                this.wallRevision = revision;
                return;
            }

            this.clearFixtures();
            if (data)
                this.createFixtures(data, 1 << scale);

            this.wallImage = wallImage;
            this.wallSnapshot = wallImage ? wallImage.clone() : null;
            this.wallRevision = revision;
            this.scale = scale;
            this.width = width;
            this.height = height;
        }

        private clearFixtures(): void {
            for (let i = 0; i < this.body.fixtures.length; ++i) {
                const fixture = this.body.fixtures[i].fixture;
                if (fixture.valid)
                    fixture.destroy();
            }
            this.body.fixtures = [];
        }

        private createFixtures(data: tiles.TileMapData, tileSize: number): void {
            const visited: boolean[] = [];
            const boxed: boolean[] = [];
            for (let row = 0; row < data.height; ++row) {
                for (let col = 0; col < data.width; ++col) {
                    const index = col + row * data.width;
                    if (visited[index] || !data.isWall(col, row))
                        continue;

                    const component: number[] = [];
                    const pending: number[] = [index];
                    visited[index] = true;
                    let minCol = col;
                    let maxCol = col;
                    let minRow = row;
                    let maxRow = row;
                    for (let i = 0; i < pending.length; ++i) {
                        const current = pending[i];
                        const currentCol = current % data.width;
                        const currentRow = Math.floor(current / data.width);
                        component.push(current);
                        minCol = Math.min(minCol, currentCol);
                        maxCol = Math.max(maxCol, currentCol);
                        minRow = Math.min(minRow, currentRow);
                        maxRow = Math.max(maxRow, currentRow);

                        this.addWallNeighbor(data, visited, pending, currentCol - 1, currentRow);
                        this.addWallNeighbor(data, visited, pending, currentCol + 1, currentRow);
                        this.addWallNeighbor(data, visited, pending, currentCol, currentRow - 1);
                        this.addWallNeighbor(data, visited, pending, currentCol, currentRow + 1);
                    }

                    const columns = maxCol - minCol + 1;
                    const rows = maxRow - minRow + 1;
                    if (component.length == columns * rows &&
                        minCol > 0 && maxCol < data.width - 1 &&
                        minRow > 0 && maxRow < data.height - 1) {
                        this.createBoxFixture(minCol, minRow, columns, rows, tileSize);
                        for (let i = 0; i < component.length; ++i)
                            boxed[component[i]] = true;
                    }
                }
            }

            this.createChainFixtures(data, boxed, tileSize);
        }

        private addWallNeighbor(data: tiles.TileMapData, visited: boolean[], pending: number[], col: number, row: number): void {
            if (col < 0 || col >= data.width || row < 0 || row >= data.height)
                return;
            const index = col + row * data.width;
            if (!visited[index] && data.isWall(col, row)) {
                visited[index] = true;
                pending.push(index);
            }
        }

        private createBoxFixture(col: number, row: number, columns: number, rows: number, tileSize: number): void {
            addShape(
                this.body,
                box(columns * tileSize, rows * tileSize, 0, 0),
                new PhysicsPoint(
                    (col + columns / 2) * tileSize,
                    (row + rows / 2) * tileSize
                ),
                0,
                0,
                0.2,
                0,
                false
            );
        }

        private createChainFixtures(data: tiles.TileMapData, boxed: boolean[], tileSize: number): void {
            const vertexWidth = data.width + 1;
            const edges: boolean[] = [];
            for (let row = 0; row < data.height; ++row) {
                for (let col = 0; col < data.width; ++col) {
                    if (data.isWall(col, row))
                        continue;

                    if (row == 0 || this.needsChain(data, boxed, col, row - 1))
                        edges[(col + row * vertexWidth) * 4] = true;
                    if (col == data.width - 1 || this.needsChain(data, boxed, col + 1, row))
                        edges[(col + 1 + row * vertexWidth) * 4 + 1] = true;
                    if (row == data.height - 1 || this.needsChain(data, boxed, col, row + 1))
                        edges[(col + 1 + (row + 1) * vertexWidth) * 4 + 2] = true;
                    if (col == 0 || this.needsChain(data, boxed, col - 1, row))
                        edges[(col + (row + 1) * vertexWidth) * 4 + 3] = true;
                }
            }

            for (let edgeIndex = 0; edgeIndex < edges.length; ++edgeIndex) {
                if (!edges[edgeIndex])
                    continue;
                const points = this.traceContour(edges, edgeIndex, vertexWidth, tileSize);
                addShape(
                    this.body,
                    chain(points, true, 0),
                    new PhysicsPoint(0, 0),
                    0,
                    0,
                    0.2,
                    0,
                    false
                );
            }
        }

        private needsChain(data: tiles.TileMapData, boxed: boolean[], col: number, row: number): boolean {
            return data.isWall(col, row) && !boxed[col + row * data.width];
        }

        private traceContour(edges: boolean[], firstEdge: number, vertexWidth: number, tileSize: number): PhysicsPoint[] {
            const dx = [1, 0, -1, 0];
            const dy = [0, 1, 0, -1];
            const firstVertex = Math.floor(firstEdge / 4);
            let vertex = firstVertex;
            let direction = firstEdge % 4;
            const gridPoints: number[] = [
                vertex % vertexWidth,
                Math.floor(vertex / vertexWidth)
            ];

            while (true) {
                edges[vertex * 4 + direction] = false;
                const col = vertex % vertexWidth + dx[direction];
                const row = Math.floor(vertex / vertexWidth) + dy[direction];
                vertex = col + row * vertexWidth;
                if (vertex == firstVertex)
                    break;
                gridPoints.push(col);
                gridPoints.push(row);
                direction = this.nextDirection(edges, vertex, direction);
            }

            const result: PhysicsPoint[] = [];
            const count = gridPoints.length / 2;
            for (let i = 0; i < count; ++i) {
                const previous = (i + count - 1) % count;
                const next = (i + 1) % count;
                const previousX = gridPoints[previous * 2];
                const previousY = gridPoints[previous * 2 + 1];
                const x = gridPoints[i * 2];
                const y = gridPoints[i * 2 + 1];
                const nextX = gridPoints[next * 2];
                const nextY = gridPoints[next * 2 + 1];
                if ((previousX == x && x == nextX) ||
                    (previousY == y && y == nextY))
                    continue;
                result.push(new PhysicsPoint(x * tileSize, y * tileSize));
            }

            // Box2D collides on the right side of each chain edge. Tilemap Y
            // increases downward, so reverse the traced screen-space contour.
            const reversed: PhysicsPoint[] = [];
            if (result.length)
                reversed.push(result[0]);
            for (let i = result.length - 1; i > 0; --i)
                reversed.push(result[i]);
            return reversed;
        }

        private nextDirection(edges: boolean[], vertex: number, direction: number): number {
            const turns = [1, 0, 3, 2];
            for (let i = 0; i < turns.length; ++i) {
                const next = (direction + turns[i]) % 4;
                if (edges[vertex * 4 + next])
                    return next;
            }
            throw "Tilemap wall contour is not closed.";
        }
    }
}
