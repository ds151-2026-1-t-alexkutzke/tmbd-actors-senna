import { useLocalSearchParams, Link } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import { api } from "../../src/api/tmdb";

interface ActorDetails {
  name: string;
  also_known_as: string[] | null;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  place_of_birth: string | null;
  adult: boolean;
  biography: string;
  profile_path: string | null;
}
interface Movie {
  id: number;
  character: string;
  title: string;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
  original_language: string;
  original_title: string;
  release_date: string;
}

export default function ActorDetailsScreen() {
  // Captura o parâmetro '[id]' do nome do arquivo
  const { id } = useLocalSearchParams();
  const [actor, setActor] = useState<ActorDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [isActorsLoading, setIsActorsLoading] = useState(true);

  useEffect(() => {
    const fetchActorDetails = async () => {
      try {
        const response = await api.get(`/person/${id}`);
        setActor(response.data);
      } catch (error) {
        console.error("Erro ao buscar detalhes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActorDetails();
  }, [id]); // O hook é re-executado caso o ID mude

  useEffect(() => {
    const fetchMovieList = async () => {
      try {
        const response = await api.get(`/person/${id}/movie_credits`);
        console.log("Resposta da API:", response.data); // Log para verificar a resposta
        setMovieList(response.data.cast || []);
      } catch (error) {
        console.error("Erro ao buscar elenco:", error);
      } finally {
        setIsActorsLoading(false);
      }
    };

    fetchMovieList();
  }, [id]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  if (!actor) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Ator não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {actor.profile_path && (
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/w500${actor.profile_path}`,
          }}
          style={styles.poster}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title}>
          {actor.name} {actor.adult ? " | Ator(a) mirim" : ""}
        </Text>
        {actor.gender === 1 && (
          <Text style={styles.statText2}>Gênero: Feminino</Text>
        )}
        {actor.gender === 2 && (
          <Text style={styles.statText2}>Gênero: Masculino</Text>
        )}
        {actor.also_known_as && actor.also_known_as.length > 0 && (
          <Text style={styles.subTitle}>
            Também conhecido(a) como: {actor.also_known_as.join(", ") || "N/A"}
          </Text>
        )}

        <View style={styles.statsContainer2}>
          {actor.place_of_birth && actor.birthday && (
            <Text style={styles.statText}>
              Nascido(a) em {actor.place_of_birth || "N/A"},{" "}
              {actor.birthday || "N/A"}
            </Text>
          )}
          {actor.deathday ? (
            <Text style={styles.statText}>
              Data de falecimento: {actor.deathday}
            </Text>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Biografia</Text>
        <Text style={styles.overview}>
          {actor.biography || "Biografia não disponível (Não fez nada?)."}
        </Text>
        <Text style={styles.sectionTitle}>Filmes</Text>
        {isActorsLoading ? (
          <ActivityIndicator size="small" color="#E50914" />
        ) : movieList.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {movieList.map((movie) => (
              <Link
                key={movie.id}
                style={styles.movieCard}
                href={`/movie/${movie.id}`}
                asChild
              >
                <Pressable>
                  {movie.poster_path && (
                    <Image
                      source={{
                        uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                      }}
                      style={styles.moviePoster}
                      resizeMode="cover"
                    />
                  )}
                  {!movie.poster_path && (
                    <View style={styles.moviePosterPlaceholder}></View>
                  )}
                  <View style={styles.subbox}>
                    <Text style={styles.movieTitle}>{movie.title}</Text>
                    <Text style={styles.statText}>
                      ⭐ {movie.vote_average.toFixed(1)}/10
                    </Text>
                    <Text style={styles.statText}>{movie.release_date}</Text>
                    <Text style={styles.statText}>{movie.character}</Text>
                  </View>
                </Pressable>
              </Link>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.errorText}>Nenhum filme encontrado.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  movieCard: {
    width: "90%",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E50914",
    shadowColor: "#ff5c5c",
    shadowOffset: { width: 15, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
    marginTop: 8,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  moviePoster: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  subbox: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    width: "100%",
    height: "100%",
    marginLeft: 14,
    marginTop: 14,
  },
  movieTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 16,
  },

  moviePosterPlaceholder: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginTop: 14,
    marginLeft: 14,
    backgroundColor: "#9b9b9b",
  },

  container: { flex: 1, backgroundColor: "#121212" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  poster: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignSelf: "center",
    marginTop: 24,
    borderWidth: 3,
    borderColor: "#E50914",
    overflow: "hidden",
  },
  content: { padding: 20 },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subTitle: {
    color: "#999999",
    fontSize: 16,
    fontStyle: "italic",
    marginBottom: 34,
  },
  statsContainer: { flexDirection: "row", gap: 16, marginBottom: 24 },
  statsContainer2: {
    flexDirection: "column",
    gap: 16,
    marginBottom: 44,
    marginTop: 4,
  },
  statText: {
    color: "#ff7077",
    fontSize: 16,
    fontWeight: "600",
  },
  statText2: {
    color: "#ff7077",
    fontSize: 16,
    marginBottom: 20,
    marginTop: -10,
    fontWeight: "600",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  overview: {
    color: "#D1D5DB",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    marginTop: 4,
  },
  errorText: { color: "#FFFFFF", fontSize: 18 },
});
