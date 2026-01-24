import { GithubIcon, LinkedinIcon, Mail, Phone } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer footer-center p-10 bg-gray-800 dark:bg-muted text-white mx-auto text-center w-full">
            <div className="flex justify-center gap-4 pt-10 pb-5">

                <a href='https://github.com/ajkn1904' target="_blank" rel="noreferrer"><GithubIcon className='text-secondary dark:text-primary hover:text-primary dark:hover:text-purple-300 h-5 w-5' /></a>

                <a href='https://www.linkedin.com/in/anika-jumana-khanam/' target="_blank" rel="noreferrer"><LinkedinIcon className='text-secondary dark:text-primary hover:text-primary dark:hover:text-purple-300 h-5 w-5' /></a>

                <a href="mailto:anika.nishat06@gmail.com"><Mail className="text-secondary dark:text-primary hover:text-primary dark:hover:text-purple-300 h-5 w-5" /></a>

                <a href="tel:+8801521228030"><Phone className="text-secondary dark:text-primary hover:text-primary dark:hover:text-purple-300 h-5 w-5" /> </a>


            </div>

            <div>
                <small>© Copyright 2026 || <span className='text-secondary dark:text-primary'> Anika Jumana Khanam Nishat </span></small>
            </div>

        </footer>
    );
};

export default Footer;