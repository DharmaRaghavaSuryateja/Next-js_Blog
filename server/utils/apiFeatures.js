const mongoose=require("mongoose")
class APIFeatures {
    constructor(mongooseQuery, queryString) {
      this.mongooseQuery = mongooseQuery;
      this.queryString = queryString;
    }
  
    filter() {
        let reqObj = { ...this.queryString };
        const excludedFields = ["page", "sort", "limit", "fields","search","author"];
        excludedFields.forEach((el) => {
          delete reqObj[el];
        });
  
        reqObj = JSON.stringify(reqObj);
        reqObj = reqObj.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        reqObj = JSON.parse(reqObj);
        this.mongooseQuery=this.mongooseQuery.find(reqObj);
        return this;
    }
    sort() {
      if (this.queryString.sort) {
        let sortBy = this.queryString.sort.split(",").join(" ");
        this.mongooseQuery.sort(sortBy);
      } else {
        this.mongooseQuery.sort("price");
      }
      return this;
    }
  
    limitFields() {
      if (this.queryString.fields) {
        const selected = this.queryString.fields.split(",").join(" ");
        this.mongooseQuery.select(selected);
      } else {
        this.mongooseQuery.select("-__v");
      }
      return this;
    }
    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        this.mongooseQuery = this.mongooseQuery
          .skip((page - 1) * limit)
          .limit(limit);
      return this;
    }
    search()
    {  
        if(this.queryString.search)
        {
            const search=this.queryString.search;
            const regex=new RegExp(search,'i');
            this.mongooseQuery=this.mongooseQuery.find({
                $or: [
                  { title: { $regex: regex } },
                  { description: { $regex: regex } }
                ]})

        }

        return this;
    }
    author()
    {
      if(this.queryString.author)
      {
          const authorData=this.queryString.author.split(',').map(id => new mongoose.Types.ObjectId(id.replace(/'/g, '')))
          this.mongooseQuery=this.mongooseQuery.find({author:{$in:authorData}})
      }
  
      return this;
  
    }

    category()
    {
      if(this.queryString.category)
      {
          const categoryData=this.queryString.category.split(',').map(id => new mongoose.Types.ObjectId(id.replace(/'/g, '')))
          this.mongooseQuery=this.mongooseQuery.find({category:{$in:categoryData}})
      }
      return this;
    }
  }
 
  module.exports = APIFeatures;
  