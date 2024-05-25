import Comment from "../models/Comment";

export const addComment = async(req: any, res: any) => {
    const {name,comment,title} = req.body;
    try {
        const newComment = new Comment({
            name: name,
            comment: comment,
            title: title
        })
        const saveComment = await newComment.save();
        return res.json(saveComment)
    } catch (error) {
        return res.status(422).send(error);
    }
}

export const getPostComments = async(req: any, res: any) => {
    const title = req.params.title;
    try {
        const postComments = await Comment.find({title: title})
        return res.json(postComments)
    } catch (error) {
        return res.status(422).send(error);
    }
}

export const addLike = async (req: any, res: any) => {
    try {
      const { commentId, userId } = req.body;
  
      // Find the comment by its ID
      const comment = await Comment.findById(commentId);
  
      if (!comment) {
        return res.status(404).json("Comment not found");
      }
  
      // Check if the user already liked the comment
      if (comment.likes.includes(userId)) {
        const indexOfUser = comment.likes.indexOf(userId);
        comment.likes.splice(indexOfUser, 1);
        await comment.save();
        return res.status(200).json(false);
      }
  
      // Add the user ID to the likes array
      comment.likes.push(userId);
  
      // Save the updated comment
      await comment.save();
  
      return res.status(200).json(true);
    } catch (error) {
      console.error(error);
      return res.status(500).json("Internal server error");
    }
  };
  export const getCommentLikes = async(req: any, res: any) => {
    const commentId = req.params.commentId;
    try {
      const comment = await Comment.findById(commentId);
      return res.json(comment.likes);
    } catch (error) {
      return res.status(422).send(error);
    }
  }