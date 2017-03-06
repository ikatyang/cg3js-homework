const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const render = (content) => {
  return execSync('haml -s', {
    input: content,
    encoding: 'utf8',
  });
};

const cwd = process.cwd();
const _inputDir = path.resolve(cwd, process.argv[2]);
const _outputDir = path.resolve(cwd, process.argv[3]);

const hamlRegex = /\.haml$/i;

(function recursiveCompile(inputDir, outputDir) {
  const names = fs.readdirSync(inputDir);
  names.forEach(name => {
    const subInputPath = path.join(inputDir, name);
    const subOutputPath = path.join(outputDir, name);
    const stat = fs.statSync(subInputPath);
    if (stat.isDirectory()) {
      if (fs.existsSync(subOutputPath)) {
        if (!fs.statSync(subOutputPath).isDirectory()) {
          throw `Path '${subOutputPath}' should be a folder.`;
        }
      } else {
        fs.mkdirSync(subOutputPath);
      }
      recursiveCompile(subInputPath, subOutputPath);
    } else if (stat.isFile()) {
      if (hamlRegex.test(name)) {
        const content = fs.readFileSync(subInputPath, 'utf8');
        fs.writeFileSync(path.join(outputDir, name.replace(hamlRegex, '.html')), render(content));
      } else {
        fs.createReadStream(subInputPath).pipe(fs.createWriteStream(subOutputPath));
      }
    }
  });
})(_inputDir, _outputDir);
