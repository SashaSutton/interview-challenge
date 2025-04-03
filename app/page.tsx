import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.ctas}>
          <Link href={"/player"} className={styles.primary}>
            Audio Player
          </Link>
          <Link href={"/library"} className={styles.secondary}>
            Library
          </Link>
        </div>
      </main>
    </div>
  );
}
