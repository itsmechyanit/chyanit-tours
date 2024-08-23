class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    console.log(this.queryString);
  }

  filter() {
    const queryObject = { ...this.queryString };

    const excludeList = ['page', 'sort', 'limit', 'fields'];
    excludeList.forEach((el) => delete queryObject[el]);
    //1 (B)Advanced Filtering
    let queryString = JSON.stringify(queryObject);
    queryString = queryString.replace(
      /\b(lt|lte|gt|gte)\b/g,
      (matched) => `$${matched}`,
    );

    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString.sort.split(',').join(' '));
    }
    return this;
  }

  projection() {
    if (this.queryString.fields) {
      this.query = this.query.select(
        this.queryString.fields.split(',').join(' '),
      );
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = ApiFeatures;
