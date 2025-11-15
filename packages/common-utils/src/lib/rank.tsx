
const ranks = [
  "Rookie I", "Rookie II", "Rookie III",
  "Aspirant I", "Aspirant II", "Aspirant III",
  "Contender I", "Contender II", "Contender III",
  "Achiever I", "Achiever II", "Achiever III",
  "Luminary I", "Luminary II", "Luminary III",
  "Visionary I", "Visionary II", "Visionary III",
  "Champion I", "Champion II",
];

interface RankDisplayProps {
    elo: number;
  }

  const RankDisplay = ({ elo }:RankDisplayProps):string => {
    const getRank = (elo: number): string => {
      const rankIndex = Math.min(Math.floor((elo - 100) / 20), ranks.length - 1);
      return ranks[rankIndex];
    };

    return getRank(elo);
}

export default RankDisplay;