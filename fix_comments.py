import os
for path in ['src/core/playtestBot.js', 'src/core/timeline.js', 'src/main.js', 'src/ui/viewport.js', 'src/core/economy.js', 'src/core/stellar.js']:
    with open(path, 'r') as f:
        content = f.read()
    
    lines = content.split('\n')
    if lines[0] == '/**' or lines[0] == '/*':
        if 'import' in lines[1]:
            imports = lines.pop(1)
            lines.insert(0, imports)
            with open(path, 'w') as f:
                f.write('\n'.join(lines))
