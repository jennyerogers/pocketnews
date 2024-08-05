import { withIronSessionApiRoute } from 'iron-session/next';
import sessionOptions from '../../config/session'; 
import db from "../../db";


export default withIronSessionApiRoute(
  async function handler(req, res) {
    if (!req.session.user) {
      return res.status(401).end();
    }

    console.log("User ID from session:", req.session.user._id);
    
    switch (req.method) {
      case 'POST':
        try {
          const newsArticle = req.body;
          console.log("Adding article to favorites:", newsArticle);
          const addedArticle = await db.favorites.addToFavoriteNews(req.session.user._id, newsArticle);
          if (!addedArticle) {
            console.error("Failed to add article to favorites.");
            return res.status(500).json({ error: "Failed to add article to favorites." });
          }
          return res.status(200).json({ article: addedArticle, message: "Article added to favorites!" });
        } catch (error) {
          console.error("Error in POST /api/favorites:", error);
          return res.status(400).json({ error: error.message });
        }

      case 'DELETE':
        try {
          const { article_id } = req.body;
          console.log("Removing article from favorites:", article_id);
          const result = await db.favorites.removeFavoriteNews(req.session.user._id, article_id);
          if (!result) {
            console.error("Failed to remove article from favorites.");
            return res.status(500).json({ error: "Failed to remove article from favorites." });
          }
          return res.status(200).json({ articleId: article_id, message: "Article removed from favorites." });
        } catch (error) {
          console.error("Error in DELETE /api/favorites:", error);
          return res.status(400).json({ error: error.message });
        }

      default:
        return res.status(405).end(); 
    }
  },
  sessionOptions
);
