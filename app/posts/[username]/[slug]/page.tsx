"use client";
import { useEffect, useState, useContext, useRef } from "react";
import { Post } from "@/app/interfaces";
import { fetchPostBySlug } from "@/app/_action/posts.action";
import { SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { useSearchParams } from "next/navigation";
import { FaBars, FaLock } from "react-icons/fa";
import {
    Popover,
    PopoverHandler,
    PopoverContent,
    Button,
    PopoverContentProps,
} from "@material-tailwind/react";
import { IoChevronDown, IoChevronForward } from "react-icons/io5";
import ScrollProgressBar from "@/app/components/ScrollProgress";

export default function PostPage({ params }: { params: { slug: string } }) {
    const [post, setPost] = useState<Post>();
    const [formattedContent, setFormattedContent] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [toc, setToc] = useState<string[]>([]);
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [zoomedImage, setZoomedImage] = useState<string>("");

    const handleImageClick = (src: string | null) => {
        if (src) {
            console.log("hi hi ohm");
            setZoomedImage(src);
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setZoomedImage("");
    };

    useEffect(() => {
        const images = document.querySelectorAll(".content img");

        console.log(images);
        images.forEach((img) => {
            const imageElement = img as HTMLImageElement;
            imageElement.style.cursor = "pointer"; // Set cursor to pointer for all images
            imageElement.addEventListener("click", () =>
                handleImageClick(imageElement.src)
            );
        });

        // return () => {
        //   images.forEach((img) => {
        //     const imageElement = img as HTMLImageElement;
        //     imageElement.removeEventListener("click", () => handleImageClick(imageElement.src));
        //   });
        // };
    }, [formattedContent]);

    useEffect(() => { });

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const fetchedPost = await fetchPostBySlug(
                    params.slug,
                    searchParams.get("key") || ""
                );

                if (fetchedPost) {
                    generateTableOfContents(fetchedPost?.post.content);

                    const post = fetchedPost?.post;

                    setPost(post);
                }
                if (fetchedPost?.error) {
                    window.alert(fetchedPost.error);
                    const userKey = window.prompt("กรุณาใส่คีย์เพื่อเข้าถึงบทความ");
                    // If userKey is not null, set the key in the URL
                    if (userKey) {
                        const newSearchParams = new URLSearchParams(
                            searchParams.toString()
                        );
                        newSearchParams.set("key", userKey);
                        window.location.search = newSearchParams.toString();
                    }
                }
            } catch (err) {
                setError("Failed to load the post.");
            }
        };
        fetchPost();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.slug]);

    const generateTableOfContents = (content: string) => {
        const headingTags = ["h2"];
        const headings: string[] = [];

        headingTags.forEach((tag, level) => {
            const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`, "g");
            let match;
            while ((match = regex.exec(content)) !== null) {
                const index = headings.length;
                const title = match[1];
                headings.push(
                    `<li><a href="#section-${title}" class="toc-link text-[#1f1f1f] dark:text-[#ffffff]">${title}</a></li>`
                );

                content = content.replace(
                    match[0],
                    `
            <${tag} id="section-${title}">${title}</${tag}>
          `
                );
                setFormattedContent(content);
            }
        });

        setToc(headings);
    };

    const addCopyButtons = () => {
        const codeBlocks = document.querySelectorAll("pre code");
        codeBlocks.forEach((block) => {
            const copyButton = document.createElement("button");
            copyButton.className = "copy-btn";

            copyButton.innerHTML = `<span class="sr-only"></span> <?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 111.07 122.88" style="enable-background:new 0 0 111.07 122.88" xml:space="preserve"><style type="text/css"><![CDATA[
	.st0{fill-rule:evenodd;clip-rule:evenodd;}
  ]]></style><g><path class="st0" d="M97.67,20.81L97.67,20.81l0.01,0.02c3.7,0.01,7.04,1.51,9.46,3.93c2.4,2.41,3.9,5.74,3.9,9.42h0.02v0.02v75.28 v0.01h-0.02c-0.01,3.68-1.51,7.03-3.93,9.46c-2.41,2.4-5.74,3.9-9.42,3.9v0.02h-0.02H38.48h-0.01v-0.02 c-3.69-0.01-7.04-1.5-9.46-3.93c-2.4-2.41-3.9-5.74-3.91-9.42H25.1c0-25.96,0-49.34,0-75.3v-0.01h0.02 c0.01-3.69,1.52-7.04,3.94-9.46c2.41-2.4,5.73-3.9,9.42-3.91v-0.02h0.02C58.22,20.81,77.95,20.81,97.67,20.81L97.67,20.81z M0.02,75.38L0,13.39v-0.01h0.02c0.01-3.69,1.52-7.04,3.93-9.46c2.41-2.4,5.74-3.9,9.42-3.91V0h0.02h59.19 c7.69,0,8.9,9.96,0.01,10.16H13.4h-0.02v-0.02c-0.88,0-1.68,0.37-2.27,0.97c-0.59,0.58-0.96,1.4-0.96,2.27h0.02v0.01v3.17 c0,19.61,0,39.21,0,58.81C10.17,83.63,0.02,84.09,0.02,75.38L0.02,75.38z M100.91,109.49V34.2v-0.02h0.02 c0-0.87-0.37-1.68-0.97-2.27c-0.59-0.58-1.4-0.96-2.28-0.96v0.02h-0.01H38.48h-0.02v-0.02c-0.88,0-1.68,0.38-2.27,0.97 c-0.59,0.58-0.96,1.4-0.96,2.27h0.02v0.01v75.28v0.02h-0.02c0,0.88,0.38,1.68,0.97,2.27c0.59,0.59,1.4,0.96,2.27,0.96v-0.02h0.01 h59.19h0.02v0.02c0.87,0,1.68-0.38,2.27-0.97c0.59-0.58,0.96-1.4,0.96-2.27L100.91,109.49L100.91,109.49L100.91,109.49 L100.91,109.49z"/></g></svg>`;

            block.parentElement?.insertBefore(copyButton, block.nextSibling);

            copyButton.addEventListener("click", () => {
                navigator.clipboard.writeText(block.textContent || "").then(() => {
                    copyButton.innerHTML = `<span class="sr-only">Copied</span> <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 13H5v-2h14v2z"></path></svg>`;
                    setTimeout(() => {
                        copyButton.innerHTML = `<span class="sr-only"></span> <?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 111.07 122.88" style="enable-background:new 0 0 111.07 122.88" xml:space="preserve"><style type="text/css"><![CDATA[
	.st0{fill-rule:evenodd;clip-rule:evenodd;}
  ]]></style><g><path class="st0" d="M97.67,20.81L97.67,20.81l0.01,0.02c3.7,0.01,7.04,1.51,9.46,3.93c2.4,2.41,3.9,5.74,3.9,9.42h0.02v0.02v75.28 v0.01h-0.02c-0.01,3.68-1.51,7.03-3.93,9.46c-2.41,2.4-5.74,3.9-9.42,3.9v0.02h-0.02H38.48h-0.01v-0.02 c-3.69-0.01-7.04-1.5-9.46-3.93c-2.4-2.41-3.9-5.74-3.91-9.42H25.1c0-25.96,0-49.34,0-75.3v-0.01h0.02 c0.01-3.69,1.52-7.04,3.94-9.46c2.41-2.4,5.73-3.9,9.42-3.91v-0.02h0.02C58.22,20.81,77.95,20.81,97.67,20.81L97.67,20.81z M0.02,75.38L0,13.39v-0.01h0.02c0.01-3.69,1.52-7.04,3.93-9.46c2.41-2.4,5.74-3.9,9.42-3.91V0h0.02h59.19 c7.69,0,8.9,9.96,0.01,10.16H13.4h-0.02v-0.02c-0.88,0-1.68,0.37-2.27,0.97c-0.59,0.58-0.96,1.4-0.96,2.27h0.02v0.01v3.17 c0,19.61,0,39.21,0,58.81C10.17,83.63,0.02,84.09,0.02,75.38L0.02,75.38z M100.91,109.49V34.2v-0.02h0.02 c0-0.87-0.37-1.68-0.97-2.27c-0.59-0.58-1.4-0.96-2.28-0.96v0.02h-0.01H38.48h-0.02v-0.02c-0.88,0-1.68,0.38-2.27,0.97 c-0.59,0.58-0.96,1.4-0.96,2.27h0.02v0.01v75.28v0.02h-0.02c0,0.88,0.38,1.68,0.97,2.27c0.59,0.59,1.4,0.96,2.27,0.96v-0.02h0.01 h59.19h0.02v0.02c0.87,0,1.68-0.38,2.27-0.97c0.59-0.58,0.96-1.4,0.96-2.27L100.91,109.49L100.91,109.49L100.91,109.49 L100.91,109.49z"/></g></svg>`;
                    }, 2000);
                });
            });
        });
    };

    useEffect(() => {
        if (post) {
            addCopyButtons();
            document.title = post?.title || "Post";
        }
    }, [post]);

    if (!post) {
        return (
            <div className=" w-full h-full flex justify-center">
                <p className="loader"></p>
            </div>
        );
    }

    const viewPrivatePost = () => {
        const userKey = window.prompt("กรุณาใส่คีย์เพื่อเข้าถึงโพสต์");
        // If userKey is not null, set the key in the URL
        if (userKey) {
            const newSearchParams = new URLSearchParams(searchParams.toString());
            newSearchParams.set("key", userKey);
            window.location.search = newSearchParams.toString();
        }
    };

    return (
        <div className="block md:flex">
            {/* Progress Bar */}
            <ScrollProgressBar />
            {/* {JSON.stringify(formattedContent)} */}
            <aside className="w-2/4 pr-4 hidden md:block">
                <div className="sticky top-[88px] md:top-[61px]">
                    <div className="overflow-hidden shadow-sm rounded-lg p-4 dark:bg-[#1f1f1f] bg-[#ffffff] max-h-[50vh]">
                        <h2 className="text-2xl font-semibold mb-2">สารบัญ</h2>
                        <ul
                            className="space-y-2 max-h-[calc(50vh-80px)] scroller py-4"
                            dangerouslySetInnerHTML={{ __html: toc.join("") }}
                        />
                    </div>
                </div>
            </aside>

            <div className="flex md:hidden justify-center max-w-full">
                <Popover
                    placement="bottom"
                    open={isOpen}
                    handler={setIsOpen}
                    animate={{
                        mount: { opacity: 1 },
                        unmount: { opacity: 0 },
                    }}
                >
                    <PopoverHandler>
                        <Button
                            placeholder={undefined}
                            onPointerEnterCapture={undefined}
                            onPointerLeaveCapture={undefined}
                            className="w-full text-body-12pt-thin md:hidden mb-4 dark:bg-[#1f1f1f] bg-[#ffffff] text-[#1f1f1f] dark:text-[#ffffff] rounded-sm shadow-sm p-2 flex items-center justify-center"
                        >
                            {" "}
                            <div>สารบัญ</div>
                            {isOpen ? (
                                <IoChevronDown className="ml-2" />
                            ) : (
                                <IoChevronForward className="ml-2" />
                            )}
                        </Button>
                    </PopoverHandler>
                    <PopoverContent
                        placeholder={undefined}
                        onPointerEnterCapture={undefined}
                        onPointerLeaveCapture={undefined}
                        className="dark:bg-[#1f1f1f] bg-[#ffffff] p-0 rounded-lg shadow-lg w-[95%]"
                    >
                        <div className="sticky top-[88px]">
                            <div className="overflow-hidden shadow-sm rounded-lg p-4 dark:bg-[#1f1f1f] bg-[#ffffff] max-h-[50vh-80px]">
                                <h2 className="text-2xl font-semibold mb-2 dark:text-[#ffffff] text-[#1f1f1f]">
                                    สารบัญ
                                </h2>
                                <ul
                                    className="space-y-2 max-h-[calc(70vh)] scroller py-4"
                                    dangerouslySetInnerHTML={{ __html: toc.join("") }}
                                    onClick={() => setIsOpen(false)}
                                />
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {!post.published && (
                <main className="w-full rounded-md p-8 dark:bg-[#1f1f1f] bg-[#ffffff]">
                    <div className="flex justify-between">
                        <p className="text-sm mb-4 dark:text-white">
                            <div className="flex items-center space-x-2">
                                <img
                                    src="https://raw.githubusercontent.com/LordEaster/ICON-LOGO/refs/heads/main/The%20Duck.png"
                                    alt={post?.Author?.name}
                                    className="w-6 h-6 rounded-full"
                                />
                                <span>{post?.Author?.name}</span>
                            </div>
                        </p>
                        <p className="text-sm mb-4 dark:text-white">
                            {new Date(post?.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                    <h1 className="text-3xl font-bold mb-4 dark:text-white">
                        {post.title}
                    </h1>
                    <hr className="border-b-1 border-gray-300 mb-6" />
                    <p>โพสต์นี้ไม่ได้เผยแพร่เป็นสาธารณะ กรุณาใส่คีย์เพื่อเข้าถึงโพสต์</p>
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => viewPrivatePost()}
                            type="submit"
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            <FaLock className="mr-2" />
                            ดูโพสต์
                        </button>
                    </div>
                </main>
            )}

            {post.published && (
                <main className="w-full rounded-md p-6 dark:bg-[#1f1f1f] bg-[#ffffff]" id="content">
                    <div className="flex justify-between">
                        <p className="text-sm mb-4 dark:text-white">
                            <div className="flex items-center space-x-2">
                                <img
                                    src="https://raw.githubusercontent.com/LordEaster/ICON-LOGO/refs/heads/main/The%20Duck.png"
                                    alt={post?.Author?.name}
                                    className="w-6 h-6 rounded-full"
                                />
                                <span>{post?.Author?.name}</span>
                            </div>
                        </p>
                        <p className="text-sm mb-4 dark:text-white">
                            {new Date(post?.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                    <h1 className="text-3xl font-bold mb-4 dark:text-white">
                        {post.title}
                    </h1>
                    <hr className="border-b-1 border-gray-300 mb-6" />
                    <div
                        dangerouslySetInnerHTML={{ __html: formattedContent }}
                        className="mt-6 content"
                    />
                    {/* Modal for Zoomed Image */}
                    {isModalOpen && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
                            <img
                                src={zoomedImage}
                                alt="Zoomed"
                                className="max-w-full max-h-full"
                                onClick={closeModal}
                            />
                        </div>
                    )}
                </main>
            )}
        </div>
    );
}
