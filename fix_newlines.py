import os

def fix_file(path):
    with open(path, 'r') as f:
        content = f.read()
    content = content.replace('\\n', '\n')
    with open(path, 'w') as f:
        f.write(content)

fix_file('src/core/playtestBot.js')
fix_file('src/core/timeline.js')
fix_file('src/main.js')
fix_file('src/ui/viewport.js')

print('Fixed literally')
