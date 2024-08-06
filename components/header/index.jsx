import styles from "./Header.module.css";
import Link from "next/link";
import useLogout from "../../hooks/useLogout";


export default function Header(props) {
  const logout = useLogout();
  return (
    <header className={styles.header}>
      <p>
        <Link href="/">Home</Link>
      </p>
      <div className={styles.links}>
        {props.isLoggedIn ? (
          <>
            <Link href="/trending">Trending</Link>
            <Link href="/search">Search</Link>
            <Link href="/favorites">Favorites</Link>
            <a href="#" onClick={logout}>
              Logout
            </a>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </header>
  );
}