import { Player } from "../components/Player";
import styles from "./page.module.css";

export default function PlayerPage() {
  return (
    <div className={styles.page}>
      <Player />
    </div>
  );
}
