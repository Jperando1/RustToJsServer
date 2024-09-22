//Imports
use actix_web::{get, web, App, HttpRequest, HttpResponse, HttpServer, Responder};
use actix_cors::Cors;
use actix_files::NamedFile;
use actix_files as fs;
use std::path::PathBuf;
use std::fs as stdfs;
use chrono::prelude::*;
use serde::Serialize;

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
            .route("/action", web::get().to(print_message))
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

//Print a message on request from client, doesn't really do anything yet
async fn print_message() -> impl Responder {
    println!("Message Recieved!");
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
