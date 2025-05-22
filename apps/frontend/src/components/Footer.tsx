import { InstagramLogoIcon } from "@radix-ui/react-icons";
import { Mail, Send, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
    return (
        <footer className="w-full bg-white border ">
            <div className=" px-4 sm:px-6 lg:px-8">

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-8 py-10 max-sm:max-w-sm max-sm:mx-auto gap-y-8">
                    <div className="col-span-full mb-10 lg:col-span-2 lg:mb-0">
                        <Link href="/" className="flex md:justify-start justify-center ">
                            <Image
                                src="https://utfs.io/f/DbhgrrAIqRoKWCwFFv4kujRo2cBDzhfSAtQ1p0ZrLwxy9lHG"
                                alt="Acme Inc"
                                width={150}
                                height={40}
                                className="object-contain"
                            />
                        </Link>
                        <p className="py-3 text-sm text-gray-500 lg:max-w-xs text-center lg:text-left">Smarter Insights. Stronger Results.</p>
                        <Link href="mailto:support@rankmarg.com" className="py-2.5 px-5 h-9 block w-fit bg-primary-600 rounded-full shadow-sm text-xs text-white mx-auto transition-all duration-500 hover:bg-primary-700 lg:mx-0">
                            Contact us
                        </Link>
                    </div>
                    
                    {/* <!--End Col--> */}
                    <div className="lg:mx-auto text-left ">
                        <h4 className="text-lg text-gray-900 font-medium mb-4">Products</h4>
                        <ul className="text-sm  transition-all duration-500">
                            <li className="mb-2"><a href="javascript:;" className="text-gray-600 hover:text-gray-900">Figma UI System</a></li>
                            <li className="mb-2"><a href="javascript:;" className=" text-gray-600 hover:text-gray-900">Icons Assets</a></li>
                            <li className="mb-2"><a href="javascript:;" className=" text-gray-600 hover:text-gray-900">Responsive Blocks</a></li>
                            <li><a href="javascript:;" className=" text-gray-600 hover:text-gray-900">Components Library</a></li>
                        </ul>
                    </div>
                    {/* <!--End Col--> */}
                    <div className="lg:mx-auto text-left">
                        <h4 className="text-lg text-gray-900 font-medium mb-4">Resources</h4>
                        <ul className="text-sm  transition-all duration-500">
                            <li className="mb-2"><a href="javascript:;" className="text-gray-600 hover:text-gray-900">FAQs</a></li>
                            <li className="mb-2"><a href="javascript:;" className=" text-gray-600 hover:text-gray-900">Quick Start</a></li>
                            <li className="mb-2"><a href="javascript:;" className=" text-gray-600 hover:text-gray-900">Documentation</a></li>
                            <li><a href="javascript:;" className=" text-gray-600 hover:text-gray-900">User Guide</a></li>
                        </ul>
                    </div>
                    {/* <!--End Col--> */}
                    <div className="lg:mx-auto text-left">
                        <h4 className="text-lg text-gray-900 font-medium mb-4">Help & support</h4>
                        <ul className="text-sm  transition-all duration-500">
                            <li className="mb-2"><Link href="javascript:;" className=" text-gray-600 hover:text-gray-900">FAQs</Link></li>
                            <li className="mb-2"><Link href="javascript:;" className="text-gray-600 hover:text-gray-900">Contact Form </Link></li>
                            <li className="mb-2"><Link href="javascript:;" className=" text-gray-600 hover:text-gray-900">User Guidelines</Link></li>
                            <li><Link href="javascript:;" className=" text-gray-600 hover:text-gray-900">Refund Policy</Link></li>
                        </ul>
                    </div>
                    {/* <!--End Col--> */}
                    <div className="lg:mx-auto text-left ">
                        <h4 className="text-lg text-gray-900 font-medium mb-4">Company</h4>
                        <ul className="text-sm  transition-all duration-500 ">
                            <li className="mb-2"><Link href="/about-us" className="text-gray-600 hover:text-gray-900">About Us</Link></li>
                            <li className="mb-2"><Link href="/contact-us:;" className=" text-gray-600 hover:text-gray-900">Contact Us</Link></li>
                            <li className="mb-2"><Link href="/privacy-policy" className=" text-gray-600 hover:text-gray-900">Privacy policy</Link></li>
                            <li><Link href="/terms" className=" text-gray-600 hover:text-gray-900">Terms and conditions</Link></li>
                        </ul>
                    </div>
                </div>
                {/* <!--Grid--> */}
                <div className="py-7 border-t border-gray-200">
                    <div className="flex items-center justify-center flex-col lg:justify-between lg:flex-row">
                        <span className="text-sm text-gray-500 ">©<a href="https://pagedone.io/">RankMarg</a> {new Date().getFullYear()}, All rights reserved.</span>
                        <div className="flex mt-4 space-x-4 sm:justify-center lg:mt-0 ">
                            <Link href="mailto:support@rankmarg.in" target="_blank" className="w-9 h-9 rounded-full bg-gray-700 flex justify-center items-center hover:bg-primary-600">
                            <Mail className="w-5 h-5 text-white" />
                            </Link>
                            <Link href="https://t.me/rankmarg" target="_blank" className="w-9 h-9 rounded-full bg-gray-700 flex justify-center items-center hover:bg-primary-600">
                            <Send className="w-5 h-5 text-white" />
                            </Link>
                            <Link href="https://www.instagram.com/rankmarg.in/" target="_blank" className="w-9 h-9 rounded-full bg-gray-700 flex justify-center items-center hover:bg-primary-600">
                            <InstagramLogoIcon className="w-5 h-5 text-white" />

                            </Link>
                            <Link href="https://www.youtube.com/@RankMarg" target="_blank" className="w-9 h-9 rounded-full bg-gray-700 flex justify-center items-center hover:bg-primary-600">
                            <Youtube className="w-5 h-5 text-white" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>

    );
};

export default Footer;