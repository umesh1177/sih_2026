import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Card component adhering to the design system.
 * It applies the `.card` utility class defined in designSystem.css.
 * Accepts optional `className` to extend styling.
 */
const Card = ({ children, className, ...rest }) => {
  // Combine base card with optional glass‑morphism style
  const classes = ['card', 'card-glass', className].filter(Boolean).join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

Card.defaultProps = {
  children: null,
  className: '',
};

export default Card;
