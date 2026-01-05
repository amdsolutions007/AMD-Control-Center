from pathlib import Path

def fix(folder: Path, prefix: str, legacy_name: str) -> None:
    for p in folder.iterdir():
        if not p.is_file():
            continue
        if not p.name.startswith(prefix):
            continue
        if ('\n' in p.name) or p.name.endswith('.'):
            target = folder / legacy_name
            if target.exists():
                stem = target.stem
                suffix = target.suffix
                i = 2
                while (folder / f'{stem}_{i}{suffix}').exists():
                    i += 1
                target = folder / f'{stem}_{i}{suffix}'
            print(f'Renaming: {p.namerm /Users/mac/Desktop/AMD_Control_Center/AUTOMATION_README.md && echo ✅
Old
README
deleted} -> {target.namerm /Users/mac/Desktop/AMD_Control_Center/AUTOMATION_README.md && echo ✅
Old
README
deleted}')
            p.rename(target)

def main() -> None:
    fix(Path('social_engine/assets/Job3_RealEstate_Mapper'), 'Real Estate-', 'Job3_Twin_Master_legacy.png')
    fix(Path('social_engine/assets/Job4_Forex_TradingBot'), 'Forex Bot-', 'Job4_Twin_Master_legacy.png')

if __name__ == '__main__':
    main()
