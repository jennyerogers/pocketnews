import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { withIronSessionSsr } from 'iron-session/next';
import sessionOptions from '../../config/session';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import styles from '../../styles/results.module.css';

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req, params }) {
    const user = req.session.user;
    const article_id = params.id;
    const props = {};

    if (user) {
      props.user = user;

      const response = await fetch(`https://newsdata.io/api/1/news?apikey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}&id=${article_id}`);
      const newsData = await response.json();

      if (newsData.status === "success" && newsData.results && newsData.results.length > 0) {
        props.article = {
          article_id: article_id,
          title: newsData.results[0].title,
          description: newsData.results[0].description,
          link: newsData.results[0].link,
          source_id: newsData.results[0].source_id,
          image_url: newsData.results[0].image_url || 'https://via.placeholder.com/128x190?text=NO IMAGE',
          pubDate: newsData.results[0].pubDate,
          country: newsData.results[0].country,
          language: newsData.results[0].language,
        };

        const favoriteNews = user.favorites || [];
        props.isFavoriteArticle = favoriteNews.some(a => a.article_id === article_id);
      } else {
        return {
          notFound: true,
        };
      }
    }

    props.isLoggedIn = !!user;
    return {
      props,
    };
  },
  sessionOptions
);

const NewsArticle = (props) => {
  const router = useRouter();
  const [currentArticle, setCurrentArticle] = useState(props.article);
  const [isFavorite, setIsFavorite] = useState(props.isFavoriteArticle);
  const { isLoggedIn } = props;

  useEffect(() => {
    if (!currentArticle) {
      router.push('/');
    }
  }, [currentArticle, router]);

  async function addToFavoriteNews(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentArticle),
      });
  
      if (res.status === 200) {
        setIsFavorite(true);
        router.replace(router.asPath);
      } else {
        const errorData = await res.json();
        console.error("Failed to add favorite:", errorData);
      }
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  }
  
  
  async function removeFavoriteNews(e) {
    e.preventDefault();
    try {
      const res = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ article_id: currentArticle.article_id }),
      });
  
      if (res.status === 200) {
        setIsFavorite(false);
        router.replace(router.asPath);
      } else {
        const errorData = await res.json();
        console.error("Failed to remove favorite:", errorData);
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  }
  

  if (!currentArticle) {
    return <div>Loading...</div>;
  }

  const {
    title,
    description,
    source_id,
    pubDate,
    country,
    language,
    link,
  } = currentArticle;

  return (
    <>
      <Head>
        <title>{title} - Pocket News</title>
        <meta name="description" content="Viewing a news article on Pocket News" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header isLoggedIn={isLoggedIn} />
      <main className={styles.container}>
        <div className={styles.titleGroup}>
          <div>
            <h1>{title}</h1>
            <h2>Source: {source_id}</h2>
            <h3>Published: {pubDate}</h3>
          </div>
          <a href={link} target="_blank" rel="noopener noreferrer" className={styles.imgContainer}>
            <img src={currentArticle.image_url} alt={title} />
            <span>Read full article</span>
          </a>
        </div>
        <p className={styles.description}>{description}</p>
        <div className={styles.links}>
          <span>Related Links:</span>
          <a href={link} target="_blank" rel="noopener noreferrer">Full Article</a>
        </div>
        {isLoggedIn && (
          <div className={styles.controls}>
            {isFavorite ? (
              <button onClick={removeFavoriteNews} className={styles.favoriteButton}>
                Remove from Favorites
              </button>
            ) : (
              <button onClick={addToFavoriteNews} className={styles.favoriteButton}>
                Add to Favorites
              </button>
            )}
          </div>
        )}
        <Link href="/search" legacyBehavior>
          <a className={styles.returnLink}>Return to Search</a>
        </Link>
      </main>
      <Footer />
    </>
  );
};

export default NewsArticle;