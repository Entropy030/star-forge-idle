import os
import re

def remove_functions(filepath, func_names):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for fn in func_names:
        # Match function definition until closing brace using a reliable regex
        # This matches the function, keeping track of braces is hard in regex,
        # but since these are standard functions with no complex nested braces,
        # we can just use a brace counter in Python.
        pass
        
    lines = content.split('\n')
    new_lines = []
    skip = False
    brace_count = 0
    
    for line in lines:
        if not skip:
            started = False
            for fn in func_names:
                if line.startswith(f'function {fn}(') or line.startswith(f'export function {fn}('):
                    skip = True
                    started = True
                    brace_count = 0
                    break
            
            if started:
                brace_count += line.count('{')
                brace_count -= line.count('}')
                if brace_count == 0:
                    skip = False
                continue
        else:
            brace_count += line.count('{')
            brace_count -= line.count('}')
            if brace_count == 0:
                skip = False
            continue
            
        new_lines.append(line)
        
    with open(filepath, 'w') as f:
        f.write('\n'.join(new_lines))

remove_functions('src/main.js', [
  'triggerSupernova',
  'triggerBigBounce',
  'triggerGalacticMerge',
  'stabilizeArms',
  'accretePlanetConfiguration'
])

print('Removed functions')
