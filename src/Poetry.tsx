import { ChangeEvent, ReactElement, useCallback, useState } from "react";
import { fetch } from "@tauri-apps/api/http";
import { invoke } from "@tauri-apps/api";

const Poetry = () => {
	return (
		<div
			id="poetry"
			className="text-center flex flex-col items-center gap-2 m-2"
		>
			<h1 className="text-5xl font-extrabold bg-secondary w-1/2 rounded-xl text-primary py-5 my-5">
				PoetryDB
			</h1>
			<AuthorsButton />
		</div>
	);
};

const renderAuthors = (authors: string[]) => {
	return (
		<div className="grid grid-cols-3 grid-rows-1 gap-2">
			{authors.map((author) => (
				<Author author={author} key={author}></Author>
			))}
		</div>
	);
};

interface AuthorProps {
	author: string;
	key: string;
}

const Author = (props: AuthorProps): ReactElement => {
	return (
		<button className="text-center font-bold col-span-1 bg-accent/20 btn btn-accent rounded">
			{props.author}
		</button>
	);
};

const AuthorsButton = (): ReactElement => {
	const [authorList, setAuthorList] = useState([""]);
	const [filteredAuthorsList, setFilteredAuthorsList] = useState([""]);
	const [authorsOpen, setAuthorsOpen] = useState(false);

	const fetchAuthors = useCallback(async () => {
		try {
			const response = await fetch<{ authors: string[] }>(
				"https://poetrydb.org/author",
				{
					method: "GET",
					timeout: 10,
				}
			);
			if (response.ok) {
				setAuthorList(response.data.authors);
				setFilteredAuthorsList(response.data.authors);
				setAuthorsOpen(true);
			}
			return;
		} catch (e) {
			console.error(e);
		}
		return;
	}, []);

	return (
		<div>
			<button
				className="btn btn-primary btn-xl mb-5"
				onClick={async () => {
					await fetchAuthors();
				}}
			>
				Authors
			</button>
			{authorsOpen && (
				<div>
					<textarea
						onChange={async (event) => {
							
							let filteredAuthors = await invoke<string[]>("search_items", {
								re: event.target.value,
								items: authorList,
							});
							setFilteredAuthorsList(filteredAuthors);
						}}
					/>
					{renderAuthors(filteredAuthorsList)}
				</div>
			)}
		</div>
	);
};

export default Poetry;
