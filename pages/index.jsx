import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { withIronSessionSsr } from "iron-session/next";
import sessionOptions from "../config/session";
import styles from "../styles/Home.module.css";
import Header from "../components/header";
import Footer from "../components/Footer";
import useLogout from "../hooks/useLogout";

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;
    const props = {};
    if (user) {
      props.user = req.session.user;
      props.isLoggedIn = true;
    } else {
      props.isLoggedIn = false;
    }
    return { props };
  },
  sessionOptions
);

export default function Home(props) {
  const router = useRouter();
  const logout = useLogout();

  return (
    <div className={styles.container}>
      
      <Head>
        <title>Pocket News</title>
        <meta name="description" content="Generated by create next app" />
       
      </Head>

      <Header isLoggedIn={props.isLoggedIn} username={props?.user?.username} />

      <main className={styles.main}>
        <h1 className={styles.title}>Pocket News</h1>
        <p className={styles.slogan}>Browse and bookmark the latest headlines</p>

        <div className={styles.grid}>
          {props.isLoggedIn ? (
            <>
              <Link href="/search" className={styles.card}>
                <h2>Search &rarr;</h2>
              </Link>

              <Link href="/trending" className={styles.card}>
                <h2>See what's trending &rarr;</h2>
              </Link>

          
            </>
          ) : (
            <>
              <Link href="/login" className={styles.card}>
                <h2>Login</h2>
              </Link>

              <Link href="/signup" className={styles.card}>
                <h2>Create Account</h2>
              </Link>
            </>
          )}
        </div>
      </main>

  
      <Footer/>

    </div>
  );
}
