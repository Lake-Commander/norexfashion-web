import home_1 from '@assets/img/menu/menu-home-1.jpg';
import home_2 from '@assets/img/menu/menu-home-2.jpg';
import home_3 from '@assets/img/menu/menu-home-3.jpg';
import home_4 from '@assets/img/menu/menu-home-4.jpg';


const menu_data = [
{
id: 1,
homes: true,
title: 'Home',
link: '/',
home_pages: [
{
img: home_1,
title: 'Norex Fashion School',
link: '/'
}
]
},

{
id: 2,
products: true,
title: 'Collections',
link: '/shop',
product_pages: [
{
title: 'Women',
link: '/shop',
mega_menus: [
{ title: 'Ankara & Traditional', link: '/shop?category=ankara' },
{ title: 'Bridal & Occasion', link: '/shop?category=bridal' },
{ title: 'Corporate Wear', link: '/shop?category=corporate' },
{ title: 'Luxury Couture', link: '/shop?category=luxury' },
]
},
  {
    title: 'Men',
    link: '/shop',
    mega_menus: [
      { title: 'Traditional Wear', link: '/shop?category=traditional' },
      { title: 'Corporate Collections', link: '/shop?category=corporate' },
      { title: 'Casual Designs', link: '/shop?category=casual' },
      { title: 'Bespoke Tailoring', link: '/shop?category=bespoke' },
    ]
  },

  {
    title: 'Services',
    link: '/shop',
    mega_menus: [
      { title: 'Custom Design', link: '/services/custom-design' },
      { title: 'Consultations', link: '/services/consultations' },
      { title: 'Uniforms & Corporate', link: '/services/corporate' },
      { title: 'Fashion Styling', link: '/services/styling' },
    ]
  },

  {
    title: 'Account',
    link: '/profile',
    mega_menus: [
      { title: 'My Account', link: '/profile' },
      { title: 'My Orders', link: '/orders' },
      { title: 'Wishlist', link: '/wishlist' },
      { title: 'Checkout', link: '/checkout' },
    ]
  }
],
},

{
id: 3,
single_link: true,
title: 'Academy',
link: '/academy'
},

{
id: 4,
single_link: true,
title: 'Portfolio',
link: '/portfolio'
},

{
id: 5,
single_link: true,
title: 'About Us',
link: '/about'
},

{
id: 6,
single_link: true,
title: 'Contact',
link: '/contact'
}
];

export default menu_data;


// mobile_menu
export const mobile_menu = [
  {
    id: 1,
    homes: true,
    title: 'Home',
    link: '/',
    home_pages: [
      {
        img: home_1,
        title: 'Norex Fashion School',
        link: '/'
      },
      {
        img: home_2,
        title: 'Academy',
        link: '/academy'
      },
      {
        img: home_3,
        title: 'Portfolio',
        link: '/portfolio'
      },
      {
        img: home_4,
        title: 'Inspirations',
        link: '/inspiration'
      }
    ]
  },
  {
    id: 2,
    sub_menu: true,
    title: 'Collections',
    link: '/shop',
    sub_menus: [
      { title: 'All Designs', link: '/shop' },
      { title: 'Women - Ankara & Traditional', link: '/shop?category=ankara' },
      { title: 'Women - Bridal & Occasion', link: '/shop?category=bridal' },
      { title: 'Men - Traditional Wear', link: '/shop?category=traditional' },
      { title: 'Men - Bespoke Tailoring', link: '/shop?category=bespoke' },
      { title: 'Custom Services', link: '/services/custom-design' },
    ],
  },
  {
    id: 3,
    sub_menu: true,
    title: 'Academy',
    link: '/academy',
    sub_menus: [
      { title: 'Design Training', link: '/academy/design-training' },
      { title: 'Sewing Classes', link: '/academy/sewing-classes' },
      { title: 'Entrepreneurship', link: '/academy/entrepreneurship' },
      { title: 'Women Empowerment', link: '/academy/empowerment' },
      { title: 'Certifications', link: '/academy/certifications' },
    ],
  },
  {
    id: 4,
    sub_menu: true,
    title: 'Services',
    link: '/services',
    sub_menus: [
      { title: 'Custom Design', link: '/services/custom-design' },
      { title: 'Fashion Consultations', link: '/services/consultations' },
      { title: 'Corporate Uniforms', link: '/services/corporate' },
      { title: 'Style Advisory', link: '/services/styling' },
      { title: 'Bridal Services', link: '/services/bridal' },
    ],
  },
  {
    id: 5,
    single_link: true,
    title: 'Portfolio',
    link: '/portfolio',
  },
  {
    id: 6,
    sub_menu: true,
    title: 'More',
    link: '/about',
    sub_menus: [
      { title: 'About Us', link: '/about' },
      { title: 'Contact Us', link: '/contact' },
      { title: 'Blog', link: '/blog' },
      { title: 'FAQ', link: '/faq' },
    ]
  },
]