import styles from "../styles/trending.module.css"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { useState, useEffect } from "react"
import Link from "next/link"
import { withIronSessionSsr } from "iron-session/next"
import sessionOptions from "../config/session"

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user
    const props = {}

    if (user) {
      props.user = req.session.user
      props.isLoggedIn = true
    } else {
      props.isLoggedIn = false
    }

    return { props }
  },
  sessionOptions
)

export default function Trending(props) {
  const [newsInfo, setNewsInfo] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchTrendingNews() {
      try {
        const res = await fetch(
          `https://newsdata.io/api/1/latest?apikey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}&language=en&country=us`
        )
        const newsData = await res.json()
        console.log(newsData)

        if (newsData.status === "success") {
            const filteredArticles = newsData.results.filter(article => article.source_id !== "nwitimes"); //filter out anything from nwitimes because it displays property listings
            const singularArticles = Array.from(new Map(filteredArticles.map(article => [article.title, article])).values());            
            setNewsInfo(singularArticles); //makes sure that there aren't duplicate/repeat articles
        } else {
          setNewsInfo([])
        }
      } catch (error) {
        console.error("Error getting data:", error)
        setError("Failed to get trending news. Please try again later.")
      }
      setLoading(false)
    }

    fetchTrendingNews()
  }, [])

  return (
    <>
      <main>
        <Header isLoggedIn={props.isLoggedIn} />
        <div className={styles.main}>
        <h1 className={styles.trendTitle}>Trending News </h1>
          <p className={styles.subheading}>Stay updated with the latest headlines.</p>
          <br />
          <div>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && newsInfo.length === 0 && <p>Oops! No trending news available. Please try again later.</p>}
            <br />
            <br />
            <div className={styles.newsResults}>
              {newsInfo && newsInfo.length > 0 && (
                newsInfo.map((article) => (
                  <div key={article.article_id} className={styles.article}>
                    <Link href={`/news/${article.article_id}`}>
                      <h3 className={styles.title}>{article.title}</h3>
                    </Link>
                    <p>{article.description}</p>
                    <p>Source: {article.source_id}</p>
                    <p>Published: {article.pubDate}</p>
                    <p>Country: {article.country}</p>
                    <p>Language: {article.language}</p>
                    <hr />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </>
  )
}
