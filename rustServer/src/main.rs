//Imports
use actix_web::{body, get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};
use actix_cors::Cors;
use actix_files::NamedFile;
use actix_files as fs;
use std::path::PathBuf;
use std::fs as stdfs;
use chrono::prelude::*;
use serde::Serialize;
use std::fs::File;
use std::io::prelude::*;

//Struct for making file list json object, can be expanded
#[derive(Serialize)]
struct FileList {
    path: String
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    //Create the HTTP server
    HttpServer::new(|| {
        let cors = Cors::permissive();
        App::new()
            .wrap(cors)
            .service(fs::Files::new("/files", "../public").show_files_listing()) //Gives access to files in the public folder at /files
            .service(fs::Files::new("/web", "../JsClient/").index_file("index.html")) //Host website client files at /web
            .route("/hey", web::get().to(manual_hello)) //Serves hello message
            .route("/time", web::get().to(serve_time)) //Serves time
            .route("/filelist", web::get().to(serve_file_list))
            .route("/action", web::post().to(print_message))
            .route("/{filename:.*}", web::get().to(index)) //Give access to filesystem
            
    })
    .bind(("127.0.0.1", 8080))? //Live at 127.0.0.1:8080
    .run() //Start the server
    .await //Await requests
}

//Get request using services
#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello world!")
}

//Manual request using route
async fn manual_hello() -> impl Responder {
    HttpResponse::Ok().body("Hey there!")
}

//Serves the current UTC time in a JSON object
async fn serve_time() -> impl Responder {
    let now = Utc::now().to_string();
    HttpResponse::Ok().json(now)
}

//print out the body of the request
async fn print_message(name: String) -> impl Responder {
    println!("Request body: {}", name);
    let json: serde_json::Value =
        serde_json::from_str(name.as_str()).expect("JSON was not well-formatted");
    println!("Parsed JSON: {:?}", json.as_object().unwrap().get("name").unwrap());
    mkdir(json.as_object().unwrap().get("name").unwrap().to_string());
    
    HttpResponse::Ok().json("acknowledged")
}

//Serve a json object containing all files in the public folder
async fn serve_file_list() -> impl Responder {
    let paths = stdfs::read_dir("../public").unwrap();
    let mut path_list = Vec::new();
    let mut temp_string;
    for path in paths {
        temp_string = path.unwrap().path().display().to_string();
        let json_builder = FileList{
            path: temp_string,
        };
        path_list.push(json_builder);
    }
    HttpResponse::Ok().json(path_list)
}

//Handle requests to fileserver
async fn index(req: HttpRequest) -> actix_web::Result<NamedFile> {
    let path: PathBuf = req.match_info().query("filename").parse().unwrap();
    Ok(NamedFile::open(path)?)
}
//Function makes a file named based on the input parameter string
fn mkdir(arg: String) -> std::io::Result<()> {
    let a = "../public/";
    let mut file = File::create(a.to_string()+ arg.as_str() +".txt")?;
    file.write_all(b"Hello, world!")?;
    Ok(())
}