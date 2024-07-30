import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import styles from '../../styles/results.module.css';
import { withIronSessionSsr } from 'iron-session/next';
import sessionOptions from '../../config/session';

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req, params }) {
    const user = req.session.user;
    const article_id = params.id;

    const props = {};

    if (user) {
      props.user = user;

      try {
        const response = await fetch(`https://newsdata.io/api/1/news?apikey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}&id=${article_id}`);
        const newsData = await response.json();

        console.log('API Response:', newsData);

        if (newsData.status === "success" && newsData.results && newsData.results.length > 0) {
          props.article = newsData.results[0];
        } else {
          return {
            notFound: true,
          };
        }
      } catch (error) {
        console.error('Error fetching data:', error);
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

const NewsArticle = ({ article, isLoggedIn }) => {
  const router = useRouter();
  const [currentArticle, setCurrentArticle] = useState(article);

  useEffect(() => {
    if (!currentArticle) {
      router.push('/');
    }
  }, [currentArticle, router]);

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
      <Header isLoggedIn={isLoggedIn} />
      <main className={styles.container}>
        <div className={styles.titleGroup}>
          <div>
            <h1>{title}</h1>
            <h2>Source: {source_id}</h2>
            <h3>Published: {pubDate}</h3>
          </div>
          <a href={link} target="_blank" rel="noopener noreferrer" className={styles.imgContainer}>
            <img src="/path/to/image.jpg" alt={title} />
            <span>Read full article</span>
          </a>
        </div>
        <p className={styles.description}>{description}</p>
        <div className={styles.links}>
          <span>Related Links:</span>
          <a href={link} target="_blank" rel="noopener noreferrer">Full Article</a>
        </div>
        <Link href="/search" legacyBehavior>
          <a className={styles.returnLink}>Return to Search</a>
        </Link>
      </main>
      <Footer />
    </>
  );
};

export default NewsArticle
