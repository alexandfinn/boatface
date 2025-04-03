import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const textureUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/waternormals.jpg';
const texturePath = path.join(__dirname, 'textures', 'waternormals.jpg');

if (!fs.existsSync(path.dirname(texturePath))) {
    fs.mkdirSync(path.dirname(texturePath), { recursive: true });
}

const file = fs.createWriteStream(texturePath);
https.get(textureUrl, function(response) {
    response.pipe(file);
    file.on('finish', function() {
        file.close();
        console.log('Water normal map texture downloaded successfully');
    });
}).on('error', function(err) {
    fs.unlink(texturePath);
    console.error('Error downloading texture:', err.message);
}); 