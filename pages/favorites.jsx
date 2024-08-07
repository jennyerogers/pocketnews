import Header from "../components/Header";
import Footer from "../components/Footer";
import { withIronSessionSsr } from "iron-session/next";
import sessionOptions from "../config/session";
import db from "../db";
import Link from "next/link";
import { useState } from "react";
import styles from "../styles/favorites.module.css";

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;
    const favorites = await db.favorites.getFavoriteNews(user._id);
    return {
      props: {
        user,
        isLoggedIn: !!user,
        initialFavorites: favorites,
      }
    };
  },
  sessionOptions
);

export default function Favorites({ user, isLoggedIn, initialFavorites }) {
  const [favorites, setFavorites] = useState(initialFavorites);

  async function handleRemove(articleId) {
    const res = await fetch('/api/favorites', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ article_id: articleId }),
    });

    if (res.status === 200) {
      setFavorites((prev) => prev.filter(article => article.article_id !== articleId));
    }
  }

  return (
    <>
      <main>
        <Header isLoggedIn={isLoggedIn} />
        <div className={styles.container}>
          <h1 className={styles.favTitle}>Your Favorites</h1>
          {favorites && favorites.length > 0 ? (
            <div className={styles.favoritesList}>
              {favorites.map(article => (
                <div key={article.article_id} className={styles.articleItem}>
                  <Link href={`/news/${article.article_id}`} className={styles.articleLink}>
                    <div className={styles.articleContent}>
                      <h2 className={styles.articleTitle}>{article.title}</h2>
                      <a href={article.link} target="_blank" rel="noopener noreferrer">
                        <img src={article.image_url || 'https://via.placeholder.com/128x190?text=NO IMAGE'} alt="Article cover" />
                      </a>
                    </div>
                  </Link>
                  <button onClick={() => handleRemove(article.article_id)} className={styles.removeButton}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.description}>Looks like you don't have any articles in your favorites yet. Go to the search page to add some!</p>
          )}
        </div>
        <Footer />
      </main>
    </>
  );
}
