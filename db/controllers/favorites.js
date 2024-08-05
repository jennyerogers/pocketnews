import User from "../models/user";
import dbConnect from "../connection";

export async function getFavoriteNews(userId) {
try {
  await dbConnect();
  const user = await User.findById(userId).lean();
  if (!user) return null;
    return JSON.parse(JSON.stringify(user.favorites));
  } catch (error) {
    console.error("Oops! There was an error fetching articles:", error);
    return null;
  }
}

export async function addToFavoriteNews(userId, newsArticle) {
  await dbConnect();
  console.log("Searching for user ID:", userId);
  const user = await User.findById(userId);
  if (!user) {
    console.error("User not found:", userId);
    return null;
  }

  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { favorites: newsArticle } }, 
    { new: true }
  );
  return newsArticle;
}



export async function removeFavoriteNews(userId, articleId) {
  await dbConnect();
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { favorites: { article_id: articleId } } }, 
    { new: true }
  );
  if (!user) return null;
  return true;
}
