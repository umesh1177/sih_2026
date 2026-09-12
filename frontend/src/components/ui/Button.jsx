import React from 'react';
import PropTypes from 'prop-types';
import './Button.css'; // optional if additional styles needed

/**
 * Button component supporting primary and secondary variants.
 * Props:
 *  - variant: 'primary' | 'secondary' (default 'primary')
 *  - onClick: handler
 *  - type: button type attribute
 *  - className: extra CSS classes
 */
const Button = ({ children, variant = 'primary', onClick, type = 'button', className, ...rest }) => {
  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  const classes = [baseClass, className].filter(Boolean).join(' ');
  return (
    <button type={type} className={classes} onClick={onClick} {...rest}>
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};

Button.defaultProps = {
  variant: 'primary',
  onClick: undefined,
  type: 'button',
  className: '',
};

export default Button;
