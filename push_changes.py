import subprocess

def run(cmd):
    p = subprocess.run(cmd, cwd=r'c:\Users\Jesse\Desktop\PROJETOS LOVA\fazendo-esporte', capture_output=True, text=True, shell=True)
    print(f"=== {cmd} ===")
    print(p.stdout.strip())
    if p.stderr.strip():
        print("ERR:", p.stderr.strip())

run('git status -s')
run('git add .')
run('git commit -m "feat: add Leandro Amelio Supabase Auth login and protect admin layout"')
run('git push origin main')
