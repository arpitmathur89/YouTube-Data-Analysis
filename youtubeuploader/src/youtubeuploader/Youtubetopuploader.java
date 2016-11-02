package youtubeuploader;
import java.io.IOException;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
//import org.apache.hadoop.mapreduce.Reducer.Context;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.TextInputFormat;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.fs.Path;

public class Youtubetopuploader {
	public static class Map extends Mapper<LongWritable,Text,Text,IntWritable>{
		private Text uploader = new Text();
		private final static IntWritable occurance = new IntWritable(1);
		public void map(LongWritable key, Text value,
				Context context) throws IOException,InterruptedException {
			
			String record = value.toString();
			String str[] = record.split(",");
			if(str.length>=7){
				uploader.set(str[7]);
			}
			context.write(uploader, occurance);
		}
	}
	
	public static class Reduce extends Reducer<Text,IntWritable,Text,IntWritable>{

		public void reduce(Text key, Iterable<IntWritable> values,
				Context context) throws IOException,InterruptedException {
			int totaloccurance = 0;

			for(IntWritable value: values)
			{
				totaloccurance+=value.get();
			}
			context.write(key, new IntWritable(totaloccurance));
			
		}
		
	}

	public static void main(String[] args) throws IOException, ClassNotFoundException, InterruptedException {
		// TODO Auto-generated method stub
		// TODO Auto-generated method stub
		
		//JobConf conf = new JobConf(WordCount.class);
		Configuration conf1= new Configuration();
		
		
		//conf.setJobName("mywc");
		@SuppressWarnings("deprecation")
		Job job = new Job(conf1,"myyoutube");
		
		job.setJarByClass(Youtubetopuploader.class);
		job.setMapperClass(Map.class);
		job.setReducerClass(Reduce.class);
		
		//conf.setMapperClass(Map.class);
		//conf.setReducerClass(Reduce.class);

		job.setOutputKeyClass(Text.class);
		job.setOutputValueClass(IntWritable.class);
		
		job.setInputFormatClass(TextInputFormat.class);
		job.setOutputFormatClass(TextOutputFormat.class);
		
		

		@SuppressWarnings("unused")
		Path outputPath = new Path(args[1]);
			
	        //Configuring the input/output path from the filesystem into the job
	        
	    FileInputFormat.addInputPath(job, new Path(args[0]));
	    FileOutputFormat.setOutputPath(job, new Path(args[1]));
			
			//deleting the output path automatically from hdfs so that we don't have delete it explicitly
			
		//outputPath.getFileSystem(conf).delete(outputPath);
			
			//exiting the job only if the flag value becomes false
			
		System.exit(job.waitForCompletion(true) ? 0 : 1);
	}



}
