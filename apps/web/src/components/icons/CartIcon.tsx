import React from 'react';

interface CartIconProps {
  size?: number;
  color?: string;
}

const CartIcon: React.FC<CartIconProps> = ({
  size = 24,
  color = 'currentColor',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Shopping cart"
  >
    {/* Cart body */}
    <path d="M1 1H5L7.68 14.39C7.77 14.87 8.02 15.31 8.39 15.63C8.77 15.95 9.24 16.13 9.73 16.13H19.16C19.63 16.13 20.08 15.97 20.45 15.67C20.82 15.38 21.08 14.97 21.18 14.51L23 6H6" />
    {/* Left wheel */}
    <circle cx={10} cy={20} r={1.5} />
    {/* Right wheel */}
    <circle cx={19} cy={20} r={1.5} />
  </svg>
);

export default CartIcon;
