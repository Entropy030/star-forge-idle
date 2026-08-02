import os

for path in ['src/core/playtestBot.js', 'src/core/timeline.js', 'src/main.js', 'src/ui/viewport.js', 'src/core/economy.js', 'src/core/stellar.js']:
    with open(path, 'r') as f:
        content = f.read()
    
    lines = content.split('\n')
    new_lines = []
    imports_to_move = []
    in_comment = False
    
    for line in lines:
        if line.startswith('/**') or line.startswith('/*'):
            in_comment = True
            new_lines.append(line)
        elif line.startswith(' */') or line.startswith('*/'):
            in_comment = False
            new_lines.append(line)
        elif in_comment and line.startswith('import '):
            imports_to_move.append(line)
        elif in_comment and (line.startswith('let ') or line.startswith('const ')):
            imports_to_move.append(line)
        else:
            new_lines.append(line)
            
    if imports_to_move:
        insert_idx = 0
        for i, line in enumerate(new_lines):
            if line.startswith('import '):
                insert_idx = i + 1
        
        for i, imp in enumerate(imports_to_move):
            new_lines.insert(insert_idx + i, imp)
            
    with open(path, 'w') as f:
        f.write('\n'.join(new_lines))

print("Fixed imports stuck in comments.")
