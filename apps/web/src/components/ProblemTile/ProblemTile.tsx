'use client';

import { colors } from '@upaya/shared';
import type { ProblemType } from '@upaya/shared';
import { Icon } from '@/components/icons';
import styles from './ProblemTile.module.css';

interface ProblemTileProps {
  problemKey: ProblemType;
  label: string;
  iconName: string;
  onClick: () => void;
}

export default function ProblemTile({ problemKey, label, iconName, onClick }: ProblemTileProps) {
  const tileColor = colors.tiles[problemKey];

  return (
    <button
      className={styles.tile}
      style={{ background: tileColor.bg, color: tileColor.text }}
      onClick={onClick}
    >
      {/* Background decoration art */}
      <span className={styles.decoration}>
        <Icon name={iconName} size={90} color={tileColor.text} />
      </span>

      <span className={styles.label}>{label}</span>
    </button>
  );
}
