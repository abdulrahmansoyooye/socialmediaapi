import joi from "joi";
export const validateCreatepost = (data)=>{
  const schema = joi.object({
    content: joi.string().min(3).max(5000).required(),
    mediaIds: joi.array(),
  })

  return schema.validate(data)
}

