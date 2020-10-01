const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const SubCategoryModel = mongoose.model('SubCategory');
const CategoryModel = mongoose.model('Category');

const selectString = '-_id -__v';

class SubCategory {

    constructor() {
        this.result = [];
        this.statusCode = 200;
    };

    setResponse(result, statusCode = 200) {
        this.result = result;
        this.statusCode = statusCode;
    }

    response() {
        return {
            result: this.result,
            statusCode: this.statusCode
        };
    }

    validate(data, validateArray) {
        const missing = new Array();
        validateArray.forEach(item => {
            if (!data[item]) missing.push(item);
        });
        if (missing.length) {
            const result = {
                message: `The fields are missing: ${missing.join().replace(/\,/g, ', ')}`
            };
            data.isInvalid = true;
            this.setResponse(result, 400);
        }
        return data;
    }

    formatRequest(data, isUpdated = false) {
        data.id = undefined;
        data.rate_stars = undefined;
        data.created_at = undefined;

        if (isUpdated) {
            data.updated_at = undefined;
        }

        for (const prop in data) {
            if (!data[prop]) delete data[prop];
        }
    }

    async getAll() {
        try {

            const categories = await SubCategoryModel.find();
            this.setResponse({ Docs: categories });

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async list({ page = 1, limit = 10 }) {
        try {

            if (limit > 50) {
                limit = 50;
            }

            const categories = await SubCategoryModel.paginate({}, { page: Number(page), limit: Number(limit), select: selectString });
            this.setResponse(categories);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async getById(id) {
        try {

            const categories = await SubCategoryModel.paginate({ id }, { select: selectString });

            if (!categories.docs.length) {
                this.setResponse({ message: 'Categories was not found!' }, 400);
                return this.response();
            }

            this.setResponse(categories.docs[0]);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async create(data) {
        try {

            const validSubCategories = this.validate(data, ['name', 'description', 'category_id']);

            if (validSubCategories.isInvalid) {
                return this.response();
            }

            const subCategories = await SubCategoryModel.find({ name: data.name });

            if (subCategories.length) {
                this.setResponse({ message: `SubCategory '${data.name}' already exists` }, 400);
                return this.response();
            };

            const category = await CategoryModel.find({ id: data.category_id });

            if (!category) {
                this.setResponse({ message: `Category '${data.master_category}' was not found` }, 400);
                return this.response();
            };

            formatRequest(data);
            const categoryCreated = await SubCategoryModel.create(data);

            const { name, description, category_id, id } = categoryCreated;
            category[0].subcategories.push({ name, description, category_id, id });

            await CategoryModel.findOneAndUpdate({ id: data.category_id }, category[0], { new: true });

            this.setResponse(categoryCreated);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async update(id, data) {
        try {

            formatRequest(data, true);
            const updatedCategory = await SubCategoryModel.findOneAndUpdate({ id }, data, { new: true });
            this.setResponse(updatedCategory);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };

    async delete(id) {
        try {

            const subCategory = await SubCategoryModel.find({ id });

            if (!subCategory || !subCategory.length) {
                this.setResponse({ message: 'Subcategory was not found' }, 400);
                return this.response()
            }

            const category = await CategoryModel.find({ id: subCategory[0].category_id });
            category[0].subcategories = category[0].subcategories.filter(item => item.id != id);

            await CategoryModel.findOneAndUpdate({ id: category[0].id }, category[0], { new: true });

            const deletedCategory = await SubCategoryModel.findOneAndDelete({ id });

            this.setResponse(deletedCategory);

        } catch (error) {
            console.error('Catch_error: ', error);
            this.setResponse(error, 500);
        } finally {
            return this.response();
        }
    };
}

function formatRequest(data, isUpdated = false) {
    data.id = undefined;

    if (isUpdated) {
        data.category_id = undefined;
    }

    for (const prop in data) {
        if (!data[prop]) delete data[prop];
    }
}

module.exports = SubCategory;