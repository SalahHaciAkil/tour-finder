const mongoose = require('mongoose');

const tourScheme = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name must be provided'],
      unique: true,
      trim: true,
      maxlength: [40, 'Tour name must be less then or equal 40 characters'],
      minlength: [10, 'Tour name must be greater then or equal 10 characters']
    },
    duration: {
      type: String,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group number']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty must be easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'rating average must me less then or equal 5'],
      min: [1, 'rating average must me greater then or equal 1']
    },

    ratingsQuantity: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 4.5
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          // this is only point to the document in the CREATION TIME, it won't work with update
          return this.price > val;
        },

        message: 'Discount price ({VALUE}) should be less then regular price'
      }
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image cover']
    },

    secret: {
      type: Boolean,
      default: false
    },

    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },

    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],

    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],

    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourScheme.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// virtual populate
tourScheme.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});
// DOCUMENT MIDDLEWARE

// save event is only run for .save and .create NOT FOR UPDATE
tourScheme.pre('save', function(next) {
  // console.log('data to be saved: ', this);
  next();
});

// tourScheme.pre('save', async function(next) {
//   this.guides = await User.find({ _id: { $in: this.guides } });
//   next();
// });

tourScheme.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

tourScheme.pre(/^find/, function(next) {
  this.find({ secret: { $ne: true } });
  this.start = Date.now();
  next();
});

tourScheme.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secret: { $ne: true } } });
  next();
});

tourScheme.post(/^find/, function(docs, next) {
  console.log(`Query took: ${Date.now() - this.start}ms`);

  next();
});

const Tour = mongoose.model('Tour', tourScheme);

module.exports = Tour;
