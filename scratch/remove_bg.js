const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const inputPath = `C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\6c78459a-a4f8-4a50-bfdd-65aade95801c\\media__1785772760375.png`;
const outputPath = path.join(__dirname, '../public/cat.png');

fs.createReadStream(inputPath)
    .pipe(new PNG({ filterType: 4 }))
    .on('parsed', function() {
        const width = this.width;
        const height = this.height;
        const data = this.data;

        function getPixel(x, y) {
            const idx = (width * y + x) << 2;
            return {
                r: data[idx],
                g: data[idx + 1],
                b: data[idx + 2],
                a: data[idx + 3],
                idx: idx
            };
        }

        function isBackgroundCandidate(r, g, b) {
            const isGray = Math.abs(r - g) < 15 && Math.abs(g - b) < 15;
            const isLight = r > 190 && g > 190 && b > 190;
            return isGray && isLight;
        }

        const visited = new Uint8Array(width * height);
        const queue = [];

        // Seed with border pixels
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
                    const p = getPixel(x, y);
                    if (isBackgroundCandidate(p.r, p.g, p.b)) {
                        const pos = y * width + x;
                        visited[pos] = 1;
                        queue.push(pos);
                    }
                }
            }
        }

        // BFS flood fill
        let head = 0;
        while (head < queue.length) {
            const pos = queue[head++];
            const cx = pos % width;
            const cy = Math.floor(pos / width);

            // Make background pixel transparent
            const pixelIdx = (width * cy + cx) << 2;
            data[pixelIdx + 3] = 0;

            const neighbors = [
                { x: cx - 1, y: cy },
                { x: cx + 1, y: cy },
                { x: cx, y: cy - 1 },
                { x: cx, y: cy + 1 }
            ];

            for (const n of neighbors) {
                if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
                    const nPos = n.y * width + n.x;
                    if (!visited[nPos]) {
                        const p = getPixel(n.x, n.y);
                        if (isBackgroundCandidate(p.r, p.g, p.b)) {
                            visited[nPos] = 1;
                            queue.push(nPos);
                        }
                    }
                }
            }
        }

        this.pack().pipe(fs.createWriteStream(outputPath)).on('finish', () => {
            console.log('Successfully saved transparent cat.png to public!');
        });
    });
