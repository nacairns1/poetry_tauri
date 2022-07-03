import { ReactElement, useCallback, useState } from "react";
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

const renderPoems = (poems: string[]) => {
	return (
		<div className="flex flex-col items-center">
			{poems.map((item) => {
				return <PoemButton title={item} key={item} />;
			})}
		</div>
	);
};

const renderPoemText = (poem: {
	author: string;
	lineCount: string;
	lines: string[];
	title: string;
}) => {
	return <div className="prose text-left bg-primary/10 rounded p-5 my-3">
		<h2 className="text-center text-xl font-extrabold">{poem.title}</h2>
		<h3 className="text-center italic ">{poem.author}</h3>
		{poem.lines.map(line => <p className="block">{line}</p>)}

	</div>;
};

interface poemProps {
	title: string;
	key: string;
}

interface AuthorProps {
	author: string;
	key: string;
}

const PoemButton = (props: poemProps) => {
	const [poem, setPoem] = useState( {
		author: "",
		lineCount: "",
		lines: [""],
		title: "",
	});
	const [poemOpen, setPoemOpen] = useState(false);
	const fetchPoem = useCallback(async (title: string) => {
		try {
			const response = await fetch<[{ 
				author: string;
				lineCount: string;
				lines: string[];
				title: string;
			} ]>(
				`https://poetrydb.org/title/${title}`,
				{
					method: "GET",
					timeout: 10,
				}
			);
			if (response.ok) {
				setPoem(response.data[0]);
				console.log(response.data[0].lines);
				setPoemOpen(true);
			}
			return;
		} catch (e) {
			console.error(e);
		}
		return;
	}, []);

	return (
		<div className="my-2" key={props.key}>
			<button
				className="btn btn-accent"
				onClick={() => {
					fetchPoem(props.title);
				}}
			>
				{props.title}
			</button>
			{poemOpen && <div>{renderPoemText(poem)}</div>}
		</div>
	);
};

const Author = (props: AuthorProps): ReactElement => {
	const [authorPoems, setAuthorPoems] = useState([""]);
	const [poemsOpen, setPoemsOpen] = useState(false);

	const fetchAuthorPoems = useCallback(async (author: string) => {
		const fetchedPoems = await fetch<[{ title: string }]>(
			` https://poetrydb.org/author/${author}/title`,
			{ method: "GET", timeout: 10 }
		);
		setPoemsOpen(true);
		setAuthorPoems(fetchedPoems.data.map((item) => item.title));
		console.log(fetchedPoems.data);
	}, []);

	return (
		<div className="col-span-1" key="props.key">
			<button
				className="text-center font-bold col-span-1 bg-accent/20 btn btn-accent rounded"
				onClick={() => fetchAuthorPoems(props.author)}
			>
				{props.author}
			</button>
			{poemsOpen && renderPoems(authorPoems)}
		</div>
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
				<div className="flex flex-col">
					<label className="text-left font-bold">Search Authors</label>
					<textarea id="searchAuthors" className="mb-5 w-full"
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
